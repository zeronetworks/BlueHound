import React, {Component, useEffect} from 'react';
import { ChartProps } from './Chart';
import { NeoBloodHoundItemInspectModal } from '../modal/BloodHoundGraphItemInspectModal';
import useDimensions from "react-cool-dimensions";
import {valueIsArray, valueIsNode, valueIsPath, valueIsRelationship} from "../report/RecordProcessing";
//import { findGraphPath, generateUniqueId, setSchema } from 'utils';
//import { writeFile, readFile } from 'fs';
//import { fork } from 'child_process';
//require('./sigma.helpers.graph.min.js');
//require('./sigma.min');
//import sigma from './sigma.min'
global.sigma = require('linkurious');
//import sigma  from 'linkurious';
import('linkurious/plugins/sigma.layouts.dagre/sigma.layout.dagre');
import('linkurious/plugins/sigma.layouts.forceLink/supervisor');
//window.sigma = require('linkurious');


const NeoBloodHoundChart = (props: ChartProps) => {
    if (props.records == null || props.records.length == 0 || props.records[0].keys == null) {
        return <>No data, re-run the report.</>
    }

    const [open, setOpen] = React.useState(false);
    const [firstRun, setFirstRun] = React.useState(true);
    const [inspectItem, setInspectItem] = React.useState({});

    const [extraRecords, setExtraRecords] = React.useState([]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [data, setData] = React.useState({ nodes: [], links: [] });

    useEffect(() => {
        buildVisualizationDictionaryFromRecords(props.records.concat(extraRecords));
    }, [extraRecords])

    let links = {};

    const g = {
        nodes: [],
        edges: []
    }

    function buildVisualizationDictionaryFromRecords(records) {
        records.forEach((record, rownumber) => {
            record._fields.forEach((field, i) => {
                extractGraphEntitiesFromField(field);
            })
        });

        let sigmaInstance = new sigma({
            graph: g,
            container: 'graph-container',
            settings: {
                edgeColor: 'default',
                edgeHoverColor: 'default',
                defaultEdgeHoverColor: 'green',
                //enableEdgeHovering: true,
                nodeColor: 'default',
                minEdgeSize: 1,
                maxEdgeSize: 2.5,
                iconThreshold: 4,
                labelThreshold: 1,
                labelAlignment: 'bottom',
                labelColor: 'default',
                font: 'Roboto',
                glyphFillColor: 'black',
                glyphTextColor: 'white',
                glyphTextThreshold: 1,
                zoomingRatio: 1.4,
                scalingMode: 'inside',
                autoRescale: true,
                //sideMargin: 1,
                drawEdgeLabels: true,
                defaultEdgeColor: '#356',
                defaultLabelColor: 'black',
                defaultEdgeLabelColor: 'black',
                defaultEdgeHoverLabelBGColor: 'white',
                edgeLabelThreshold: 1,
                edgeLabelSize: 10
            }
        });

        //sigma.plugins.layouts.dagre.start(sigmaInstance)


        //Monkeypatch the drawIcon function to add font-weight to the canvas drawing for drawIcon
        //Kill me.
        sigma.utils.canvas.drawIcon = function (
            node,
            x,
            y,
            size,
            context,
            threshold
        ) {
            const font = node.icon.font || 'Arial',
                fgColor = node.icon.color || '#F00',
                text = node.icon.content || '?',
                px = node.icon.x || 0.5,
                py = node.icon.y || 0.5,
                height = size,
                width = size;
            let fontSizeRatio = 0.7;
            if (typeof node.icon.scale === 'number') {
                fontSizeRatio = Math.abs(Math.max(0.01, node.icon.scale));
            }

            const fontSize = Math.round(fontSizeRatio * height);

            context.save();
            context.fillStyle = fgColor;
            context.font = '900 ' + fontSize + 'px ' + font;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, x, y);
            context.restore();
        };

        //Monkeypatch the middleware with a customized patch from here: https://github.com/jacomyal/sigma.js/pull/302/files
        sigma.middlewares.rescale = function (
            readPrefix,
            writePrefix,
            options
        ) {
            const _this = this;
            let i,
                l,
                a,
                b,
                c,
                d,
                scale,
                margin;
            const n = this.graph.nodes(),
                e = this.graph.edges(),
                settings = this.settings.embedObjects(options || {}),
                bounds =
                    settings('bounds') ||
                    sigma.utils.getBoundaries(this.graph, readPrefix, true);
            let minX = bounds.minX,
                minY = bounds.minY,
                maxX = bounds.maxX,
                maxY = bounds.maxY;
            const sizeMax = bounds.sizeMax,
                weightMax = bounds.weightMax,
                w = settings('width') || 1,
                h = settings('height') || 1;
            let rescaleSettings = settings('autoRescale');
            const validSettings = {
                nodePosition: 1,
                nodeSize: 1,
                edgeSize: 1,
            };
            /**
             * What elements should we rescale?
             */
            if (!(rescaleSettings instanceof Array))
                rescaleSettings = ['nodePosition', 'nodeSize', 'edgeSize'];

            for (i = 0, l = rescaleSettings.length; i < l; i++)
                if (!validSettings[rescaleSettings[i]])
                    throw new Error(
                        'The rescale setting "' +
                        rescaleSettings[i] +
                        '" is not recognized.'
                    );

            const np = ~rescaleSettings.indexOf('nodePosition'),
                ns = ~rescaleSettings.indexOf('nodeSize'),
                es = ~rescaleSettings.indexOf('edgeSize');

            if (np) {
                /**
                 * First, we compute the scaling ratio, without considering the sizes
                 * of the nodes : Each node will have its center in the canvas, but might
                 * be partially out of it.
                 */
                scale =
                    settings('scalingMode') === 'outside'
                        ? Math.max(
                            w / Math.max(maxX - minX, 1),
                            h / Math.max(maxY - minY, 1)
                        )
                        : Math.min(
                            w / Math.max(maxX - minX, 1),
                            h / Math.max(maxY - minY, 1)
                        );

                _this.graph.currentScale = scale;
                /**
                 * Then, we correct that scaling ratio considering a margin, which is
                 * basically the size of the biggest node.
                 * This has to be done as a correction since to compare the size of the
                 * biggest node to the X and Y values, we have to first get an
                 * approximation of the scaling ratio.
                 **/
                margin =
                    (settings('rescaleIgnoreSize')
                        ? 0
                        : (settings('maxNodeSize') || sizeMax) / scale) +
                    (settings('sideMargin') || 0);
                maxX += margin;
                minX -= margin;
                maxY += margin;
                minY -= margin;

                // Fix the scaling with the new extrema:
                scale =
                    settings('scalingMode') === 'outside'
                        ? Math.max(
                            w / Math.max(maxX - minX, 1),
                            h / Math.max(maxY - minY, 1)
                        )
                        : Math.min(
                            w / Math.max(maxX - minX, 1),
                            h / Math.max(maxY - minY, 1)
                        );
                _this.graph.currentScale = scale;
            }

            // Size homothetic parameters:
            if (!settings('maxNodeSize') && !settings('minNodeSize')) {
                a = 1;
                b = 0;
            } else if (settings('maxNodeSize') === settings('minNodeSize')) {
                a = 0;
                b = +settings('maxNodeSize');
            } else {
                a =
                    (settings('maxNodeSize') - settings('minNodeSize')) /
                    sizeMax;
                b = +settings('minNodeSize');
            }

            if (!settings('maxEdgeSize') && !settings('minEdgeSize')) {
                c = 1;
                d = 0;
            } else if (settings('maxEdgeSize') === settings('minEdgeSize')) {
                c = 0;
                d = +settings('minEdgeSize');
            } else {
                c =
                    (settings('maxEdgeSize') - settings('minEdgeSize')) /
                    weightMax;
                d = +settings('minEdgeSize');
            }

            // Rescale the nodes and edges:
            for (i = 0, l = e.length; i < l; i++)
                e[i][writePrefix + 'size'] =
                    e[i][readPrefix + 'size'] * (es ? c : 1) + (es ? d : 0);

            for (i = 0, l = n.length; i < l; i++) {
                n[i][writePrefix + 'size'] =
                    n[i][readPrefix + 'size'] * (ns ? a : 1) + (ns ? b : 0);

                if (np) {
                    n[i][writePrefix + 'x'] =
                        (n[i][readPrefix + 'x'] - (maxX + minX) / 2) *
                        (this.graph.initScale || scale);
                    n[i][writePrefix + 'y'] =
                        (n[i][readPrefix + 'y'] - (maxY + minY) / 2) *
                        (this.graph.initScale || scale);
                } else {
                    n[i][writePrefix + 'x'] = n[i][readPrefix + 'x'];
                    n[i][writePrefix + 'y'] = n[i][readPrefix + 'y'];
                }
            }
        };

        //sigma.layouts.stopForceLink();
        //sigma.layouts.startForceLink();
        //sigmaInstance.refresh({ skipIndexation: true });
    }

    function extractGraphEntitiesFromField(value) {
        if (value == undefined) {
            return
        }
        if (valueIsArray(value)) {
            value.forEach((v, i) => extractGraphEntitiesFromField(v));
        } else if (valueIsNode(value)) {
            if (!g.nodes.some(e => e.id === value.identity.low)) {
                g.nodes.push({
                    id: value.identity.low,
                    label: value.properties.name,
                    x: Math.random(),
                    y: Math.random(),
                    size: 10,
                    color: '#666'
                })
            }
        } else if (valueIsRelationship(value)) {
            if (links[value.start.low + "," + value.end.low] == undefined) {
                links[value.start.low + "," + value.end.low] = [];
            }

            g.edges.push({
                id: value.identity.low,
                label: value.type,
                source: value.start.low,
                target: value.end.low,
                size: 2,
                color: '#ccc'
            })
        } else if (valueIsPath(value)) {
            value.segments.map((segment, i) => {
                extractGraphEntitiesFromField(segment.start);
                extractGraphEntitiesFromField(segment.relationship);
                extractGraphEntitiesFromField(segment.end);
            });
        }
    }

    const { observe, unobserve, width, height, entry } = useDimensions({
        onResize: ({ observe, unobserve, width, height, entry }) => {
            // Triggered whenever the size of the target is changed...
            unobserve(); // To stop observing the current target element
            observe(); // To re-start observing the current target element
        },
    });

    const { useRef } = React;

    return <>
        <div ref={observe} style={{ paddingLeft: "10px", position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
            <div id="container">
                <div id="graph-container"/>
            </div>

            <NeoBloodHoundItemInspectModal open={open} handleClose={handleClose} title={(inspectItem.labels && inspectItem.labels.join(", ")) || inspectItem.type} object={inspectItem.properties}></NeoBloodHoundItemInspectModal>
        </div>
    </>
}

export default NeoBloodHoundChart;
