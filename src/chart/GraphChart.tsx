
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ReactDOMServer from 'react-dom/server';
import useDimensions from "react-cool-dimensions";
import { categoricalColorSchemes } from '../config/ColorConfig';
import { ChartProps } from './Chart';
import { valueIsArray, valueIsNode, valueIsRelationship, valueIsPath } from '../report/RecordProcessing';
import { NeoGraphItemInspectModal } from '../modal/GraphItemInspectModal';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan';
import { Card, CardContent, CardHeader, Tooltip } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

const BLOODHOUND_NODE_LABELS = ['Computer', 'ComputerTarget', 'Container', 'Domain', 'GPO', 'Group', 'GroupTarget', 'OU', 'User']

const getNodeLabel = (labels) => {
    for (let bloodhoundLabel of BLOODHOUND_NODE_LABELS) {
        const foundIndex = labels.indexOf(bloodhoundLabel);
        if (foundIndex != -1) {
            return labels[foundIndex]
        }
    }
    return labels[-1]
}

const update = (state, mutations) =>
    Object.assign({}, state, mutations)

const imageExists = (image) => { return image && image.height > 0; }

const layouts = {
    "force-directed": undefined,
    "tree": "td",
    "tree-horizontal": "lr",
    "radial": "radialout"
};

/**
 * Draws graph data using a force-directed-graph visualization.
 * This visualization is powered by `react-force-graph`. 
 * See https://github.com/vasturiano/react-force-graph for examples on customization.
 */
const NeoGraphChart = (props: ChartProps) => {
    if (props.records == null || props.records.length == 0 || props.records[0].keys == null) {
        return <>No data, re-run the report.</>
    }

    const [open, setOpen] = React.useState(false);
    const [firstTick, setFirstTick] = React.useState(true);
    const [firstRender, setFirstRender] = React.useState(true);
    const [renderFinished, setRenderFinished] = React.useState(false);
    const [inspectItem, setInspectItem] = React.useState({});

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // Retrieve config from advanced settings
    const backgroundColor = props.settings && props.settings.backgroundColor ? props.settings.backgroundColor : "#fafafa";
    const nodeSizeProp = props.settings && props.settings.nodeSizeProp ? props.settings.nodeSizeProp : "size";
    const nodeColorProp = props.settings && props.settings.nodeColorProp ? props.settings.nodeColorProp : "color";
    const defaultNodeSize = props.settings && props.settings.defaultNodeSize ? props.settings.defaultNodeSize : 2;
    const relWidthProp = props.settings && props.settings.relWidthProp ? props.settings.relWidthProp : "width";
    const relColorProp = props.settings && props.settings.relColorProp ? props.settings.relColorProp : "color";
    const defaultRelWidth = props.settings && props.settings.defaultRelWidth ? props.settings.defaultRelWidth : 1;
    const defaultRelColor = props.settings && props.settings.defaultRelColor ? props.settings.defaultRelColor : "#909090";
    const nodeLabelColor = props.settings && props.settings.nodeLabelColor ? props.settings.nodeLabelColor : "black";
    const nodeLabelFontSize = props.settings && props.settings.nodeLabelFontSize ? props.settings.nodeLabelFontSize : 3.5;
    const relLabelFontSize = props.settings && props.settings.relLabelFontSize ? props.settings.relLabelFontSize : 4;
    const relLabelColor = props.settings && props.settings.relLabelColor ? props.settings.relLabelColor : "#909090";
    const nodeColorScheme = props.settings && props.settings.nodeColorScheme ? props.settings.nodeColorScheme : "bluehound";
    const showPropertiesOnHover = props.settings && props.settings.showPropertiesOnHover !== undefined ? props.settings.showPropertiesOnHover : true;
    const showPropertiesOnClick = props.settings && props.settings.showPropertiesOnClick !== undefined ? props.settings.showPropertiesOnClick : true;
    const fixNodeAfterDrag = props.settings && props.settings.fixNodeAfterDrag !== undefined ? props.settings.fixNodeAfterDrag : true;
    const layout = props.settings && props.settings.layout !== undefined ? props.settings.layout : "force-directed";
    const lockable = props.settings && props.settings.lockable !== undefined ? props.settings.lockable : true;
    const selfLoopRotationDegrees = 45;
    const rightClickToExpandNodes = false; // TODO - this isn't working properly yet, disable it.
    const defaultNodeColor = "lightgrey"; // Color of nodes without labels
    const linkDirectionalParticles = props.settings && props.settings.relationshipParticles ? 5 : undefined;
    const linkDirectionalParticleSpeed = 0.005; // Speed of particles on relationships.
    const randomSeed = props.randomSeed;
    const domainControllersGroup = props.getGlobalParameter("bluehound_ou_name");
    const domainAdminsGroup = props.getGlobalParameter("bluehound_group_name");
    const crownJewelsComputers = props.getGlobalParameter("bluehound_computer_name");

    const [data, setData] = React.useState({ nodes: [], links: [] });

    // Create the dictionary used for storing the memory of dragged node positions.
    if (props.settings.nodePositions == undefined) {
        props.settings.nodePositions = {};
    }
    var nodePositions = props.settings && props.settings.nodePositions;

    // 'frozen' indicates that the graph visualization engine is paused, node positions and stored and only dragging is possible.
    const [frozen, setFrozen] = React.useState(props.settings && props.settings.frozen !== undefined ? props.settings.frozen : false);

    // Currently unused, but dynamic graph exploration could be done with these records.
    const [extraRecords, setExtraRecords] = React.useState([]);

    // When data is refreshed, rebuild the visualization data.
    /*useEffect(() => {
        //buildVisualizationDictionaryFromRecords(props.records);
    }, [])*/

    /*useEffect( () => {
        if (!firstTick) {
            fgRef.current.zoom(0.8);
            buildVisualizationDictionaryFromRecords(props.records);
        }


    }, [randomSeed])*/

    const { observe, unobserve, width, height, entry } = useDimensions({
        onResize: ({ observe, unobserve, width, height, entry }) => {
            // Triggered whenever the size of the target is changed...
            unobserve(); // To stop observing the current target element
            observe(); // To re-start observing the current target element
        },
    });


    // Dictionaries to populate based on query results.
    var nodes = {};
    var nodeLabels = {};
    var links = {};
    var linkTypes = {};

    // Build images list
    const imgs = Object.fromEntries(BLOODHOUND_NODE_LABELS
        .map(src => {
            const img = new Image();
            img.src = src + '.png';
            return [src, img];
        }));

    // Gets all graphy objects (nodes/relationships) from the complete set of return values.
    function extractGraphEntitiesFromField(value) {
        if (value == undefined) {
            return
        }
        if (valueIsArray(value)) {
            value.forEach((v, i) => extractGraphEntitiesFromField(v));
        } else if (valueIsNode(value)) {
            value.labels.forEach(l => nodeLabels[l] = true)
            nodes[value.identity.low] = {
                id: value.identity.low,
                labels: value.labels,
                size: value.properties[nodeSizeProp] ? value.properties[nodeSizeProp] : defaultNodeSize,
                properties: value.properties,
                lastLabel: getNodeLabel(value.labels)
            };
            if (frozen && nodePositions && nodePositions[value.identity.low]) {
                nodes[value.identity.low]["fx"] = nodePositions[value.identity.low][0];
                nodes[value.identity.low]["fy"] = nodePositions[value.identity.low][1];
            }
        } else if (valueIsRelationship(value)) {
            if (links[value.start.low + "," + value.end.low] == undefined) {
                links[value.start.low + "," + value.end.low] = [];
            }
            const addItem = (arr, item) => arr.find((x) => x.id === item.id) || arr.push(item);
            addItem(links[value.start.low + "," + value.end.low], {
                id: value.identity.low,
                source: value.start.low,
                target: value.end.low,
                type: value.type,
                width: value.properties[relWidthProp] ? value.properties[relWidthProp] : defaultRelWidth,
                color: value.properties[relColorProp] ? value.properties[relColorProp] : defaultRelColor,
                properties: value.properties
            });

        } else if (valueIsPath(value)) {
            value.segments.map((segment, i) => {
                extractGraphEntitiesFromField(segment.start);
                extractGraphEntitiesFromField(segment.relationship);
                extractGraphEntitiesFromField(segment.end);
            });
        }
    }

    // Function to manually compute curvatures for dense node pairs.
    function getCurvature(index, total) {
        if (total <= 6) {
            // Precomputed edge curvatures for nodes with multiple edges in between.
            const curvatures = {
                0: 0,
                1: 0,
                2: [-0.5, 0.5],  // 2 = Math.floor(1/2) + 1
                3: [-0.5, 0, 0.5], // 2 = Math.floor(3/2) + 1
                4: [-0.66666, -0.33333, 0.33333, 0.66666], // 3 = Math.floor(4/2) + 1
                5: [-0.66666, -0.33333, 0, 0.33333, 0.66666], // 3 = Math.floor(5/2) + 1
                6: [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75], // 4 = Math.floor(6/2) + 1
                7: [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75], // 4 = Math.floor(7/2) + 1
            }
            return curvatures[total][index];
        }
        const arr1 = [...Array(Math.floor(total / 2)).keys()].map(i => {
            return (i + 1) / (Math.floor(total / 2) + 1)
        })
        const arr2 = (total % 2 == 1) ? [0] : [];
        const arr3 = [...Array(Math.floor(total / 2)).keys()].map(i => {
            return (i + 1) / -(Math.floor(total / 2) + 1)
        })
        return arr1.concat(arr2).concat(arr3)[index];
    }

    function buildVisualizationDictionaryFromRecords(records) {
        // Extract graph objects from result set.
        records.forEach((record, rownumber) => {
            record._fields.forEach((field, i) => {
                extractGraphEntitiesFromField(field);
            })
        });
        // Assign proper curvatures to relationships.
        // This is needed for pairs of nodes that have multiple relationships between them, or self-loops.
        const linksList = Object.values(links).map(nodePair => {
            return nodePair.map((link, i) => {
                if (link.source == link.target) {
                    // Self-loop
                    return update(link, { curvature: 0.4 + (i) / 8 });
                } else {
                    // If we also have edges from the target to the source, adjust curvatures accordingly.
                    const mirroredNodePair = links[link.target + "," + link.source];
                    if (!mirroredNodePair) {
                        return update(link, { curvature: getCurvature(i, nodePair.length) });
                    } else {
                        return update(link, {
                            curvature: (link.source > link.target ? 1 : -1) *
                                getCurvature(link.source > link.target ? i : i + mirroredNodePair.length,
                                    nodePair.length + mirroredNodePair.length)
                        });
                    }
                }
            });
        });

        // Assign proper colors to nodes.
        const totalColors = categoricalColorSchemes[nodeColorScheme].length;
        const nodeLabelsList = Object.keys(nodeLabels);
        const nodesList = Object.values(nodes).map(node => {
            let assignedColor = node.properties[nodeColorProp] ? node.properties[nodeColorProp] :
                categoricalColorSchemes[nodeColorScheme][nodeLabelsList.indexOf(node.lastLabel) % totalColors];

            let img = node.lastLabel;
            if (node.properties["name"] == domainAdminsGroup) {
                img = 'GroupTarget'
                assignedColor = 'red';
                node.size = defaultNodeSize + 1;
            } else if (Array.isArray(crownJewelsComputers) && crownJewelsComputers.includes(node.properties["name"])) {
                img = 'ComputerTarget'
                assignedColor = 'blue';
                node.size = defaultNodeSize + 1;
            }

            if (node.lastLabel == 'Computer' && node.properties["is_vulnerable"] == true) {
                assignedColor = 'red';
            }

            /*const labelName = "test1" + ".png";
            const newImage = new Image();
            newImage.onload = () => {
                imgs[labelName] = newImage;
            }
            newImage.src = labelName;
            //console.log(newImage.currentSrc)*/


            let image;
            if (node.lastLabel in imgs) {
                image = imgs[node.lastLabel];
            } else {
                const newImage = new Image();
                newImage.src = node.lastLabel + '.png';
                if (imageExists(newImage)) {
                    imgs[node.lastLabel] = newImage;
                    image = newImage;
                }
            }
            return update(node, { color: assignedColor ? assignedColor : defaultNodeColor, image: image });
        });

        // Set the data dictionary that is read by the visualization.
        setData({
            nodes: nodesList,
            links: linksList.flat()
        });
    }

    const generateTooltip = (value) => {
        const tooltip =  <Card>
            
            <b style={{padding: "10px"}}>

            {value.labels ? (value.labels.length > 0 ? value.labels.join(", ") : "Node") : value.type}
            </b>

            {Object.keys(value.properties).length == 0 ?
                        <i><br/>(No properties)</i> : 
            <TableContainer>
                <Table size="small">
                    <TableBody>
                        {Object.keys(value.properties).map((key) => (
                            <TableRow key={key}>
                                <TableCell component="th" scope="row"  style={{padding: "3px", paddingLeft: "8px"}}>
                                    {key}
                                </TableCell>
                                <TableCell align={"left"}  style={{padding: "3px", paddingLeft: "8px"}}>
                                    {(value.properties[key].toString().length <= 30) ?
                                        value.properties[key].toString() :
                                        value.properties[key].toString().substring(0, 40) + "..."}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer> }
    
           
        </Card>;
        return ReactDOMServer.renderToString(tooltip);
    }

    const renderNodeLabel = (node) => {
        const selectedProp = props.selection && props.selection[node.lastLabel];
        if (selectedProp == "(id)") {
            return node.id;
        }
        if (selectedProp == "(label)") {
            return node.labels;
        }
        if (selectedProp == "(no label)") {
            return "";
        }
        return node.properties[selectedProp] ? node.properties[selectedProp] : "";
    }

    // TODO - implement this.
    const handleExpand = useCallback(node => {
        if (rightClickToExpandNodes) {
            props.queryCallback && props.queryCallback("MATCH (n)-[e]-(m) WHERE id(n) =" + node.id + " RETURN e,m", {}, setExtraRecords);
        }
    }, []);

    const showPopup = useCallback(item => {
        if (showPropertiesOnClick) {
            setInspectItem(item);
            handleOpen();
        }
    }, []);

    // If the set of extra records gets updated (e.g. on relationship expand), rebuild the graph.
    useEffect(() => {
        buildVisualizationDictionaryFromRecords(props.records.concat(extraRecords));
    }, [extraRecords])

    const { useRef } = React;

    const calculateZoomAmount = () => {
        let zoomAmount = 40
        if (data.nodes.length <= 2) {
            zoomAmount = 80;
        } else if (data.nodes.length < 4) {
            zoomAmount = 80;
        }
        return zoomAmount;
    }


    useEffect(() => {
        if (!firstTick) {
            fgRef.current.zoom(0.8)
            buildVisualizationDictionaryFromRecords(props.records);
        }
    }, [props.records])

    // Return the actual graph visualization component with the parsed data and selected customizations.
    const fgRef = useRef();
    return <>
        <div ref={observe} style={{ paddingLeft: "10px", position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
            <Tooltip title="Fit graph to view." aria-label="">
                <SettingsOverscanIcon onClick={(e) => {
                    fgRef.current.zoomToFit(400, calculateZoomAmount());
                }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: 11, right: 34, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></SettingsOverscanIcon>
            </Tooltip>
            {lockable ? (frozen ?
                <Tooltip title="Toggle dynamic graph layout." aria-label="">
                    <LockIcon onClick={(e) => {
                        setFrozen(false);
                        if (props.settings) {
                            props.settings.frozen = false;
                        }
                    }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: 12, right: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></LockIcon>
                </Tooltip>
                :
                <Tooltip title="Toggle fixed graph layout." aria-label="">
                    <LockOpenIcon onClick={(e) => {
                        if (nodePositions == undefined) {
                            nodePositions = {};
                        }
                        setFrozen(true);
                        if (props.settings) {
                            props.settings.frozen = true;
                        }
                    }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: 12, right: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></LockOpenIcon>
                </Tooltip>
            ) : <></>}
            <ForceGraph2D
                ref={fgRef}
                width={width ? width - 10 : 0}
                height={height ? height - 10 : 0}
                linkCurvature="curvature"
                backgroundColor={backgroundColor}
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}
                dagMode={layouts[layout]}
                dagLevelDistance={50}
                linkWidth={link => link.width}
                linkLabel={link => showPropertiesOnHover ? `<div>${generateTooltip(link)}</div>` : ""}
                nodeLabel={node => showPropertiesOnHover ? `<div>${generateTooltip(node)}</div>` : ""}
                nodeVal={node => node.size}
                onNodeClick={showPopup}
                onLinkClick={showPopup}
                onNodeRightClick={handleExpand}
                linkDirectionalParticles={linkDirectionalParticles}
                linkDirectionalParticleSpeed={d => linkDirectionalParticleSpeed}
                cooldownTicks={100}
                onEngineTick={() => {
                    if (firstTick) {
                        setFirstTick(false);
                        const link_distance = data.nodes.length <= 5 ? 50 : 30
                        fgRef.current.d3Force('link').distance(link => link_distance)
                    }
                }}
                onEngineStop={() => {
                    if (firstRender) {
                        setFirstRender(false);
                        fgRef.current.zoomToFit(400, calculateZoomAmount());
                    }
                    setRenderFinished(true);
                }}
                onNodeDragEnd={node => {
                    if (fixNodeAfterDrag) {
                        node.fx = node.x;
                        node.fy = node.y;
                    }
                    if (frozen) {
                        if (nodePositions == undefined) {
                            nodePositions = {};
                        }
                        nodePositions["" + node.id] = [node.x, node.y];
                    }
                }}
                nodeCanvasObjectMode={() => "after"}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    if (imageExists(node.image)) ctx.drawImage(node.image, node.x - 6, node.y - 6, 12, 12);

                    const label = (props.selection && props.selection[node.lastLabel]) ? renderNodeLabel(node) : "";
                    const fontSize = nodeLabelFontSize;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.fillStyle = nodeLabelColor;
                    ctx.textAlign = "center";
                    ctx.fillText(label, node.x, node.y + 10);

                    if (frozen && !node.fx && !node.fy && nodePositions) {
                        node.fx = node.x;
                        node.fy = node.y;
                        nodePositions["" + node.id] = [node.x, node.y];
                    }
                    if (!frozen && node.fx && node.fy && nodePositions && nodePositions[node.id]) {
                        nodePositions[node.id] = undefined;
                        node.fx = undefined;
                        node.fy = undefined;
                    }

                }}
                linkCanvasObjectMode={() => "after"}
                linkCanvasObject={(link, ctx, globalScale) => {
                    if (renderFinished) {
                        const label = link.properties.name || link.type || link.id;
                        const fontSize = relLabelFontSize;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.fillStyle = relLabelColor;
                        if (link.target != link.source) {
                            const lenX = (link.target.x - link.source.x);
                            const lenY = (link.target.y - link.source.y);
                            const posX = link.target.x - lenX / 2;
                            const posY = link.target.y - lenY / 2;
                            const length = Math.sqrt(lenX * lenX + lenY * lenY)
                            const angle = Math.atan(lenY / lenX)
                            ctx.save();
                            ctx.translate(posX, posY);
                            ctx.rotate(angle);
                            // Mirrors the curvatures when the label is upside down.
                            const mirror = (link.source.x > link.target.x) ? 1 : -1;
                            ctx.textAlign = "center";
                            if (link.curvature) {
                                ctx.fillText(label, 0, mirror * length * link.curvature * 0.5);
                            } else {
                                ctx.fillText(label, 0, 0);
                            }
                            ctx.restore();
                        } else {
                            ctx.save();
                            ctx.translate(link.source.x, link.source.y);
                            ctx.rotate(Math.PI * selfLoopRotationDegrees / 180);
                            ctx.textAlign = "center";
                            ctx.fillText(label, 0, -18.7 + -37.1 * (link.curvature - 0.5));
                            ctx.restore();
                        }
                    }
                }}
                graphData={width ? data : { nodes: [], links: [] }}
            />

            <NeoGraphItemInspectModal open={open} handleClose={handleClose} title={(inspectItem.labels && inspectItem.labels.join(", ")) || inspectItem.type} object={inspectItem.properties}></NeoGraphItemInspectModal>
        </div>
    </>
}

export default NeoGraphChart;
