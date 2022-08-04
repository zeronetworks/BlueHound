import { updateReportSize, UPDATE_REPORT_SIZE } from '../card/CardActions';
import cardReducer from '../card/CardReducer';
import {
    CREATE_REPORT,
    REMOVE_REPORT,
    SHIFT_REPORT_LEFT,
    SHIFT_REPORT_RIGHT,
    SET_PAGE_TITLE,
    FORCE_REFRESH_PAGE
} from './PageActions';

const update = (state, mutations) =>
    Object.assign({}, state, mutations)

export const DASHBOARD_PAGES_INITIAL_STATE = [
    {
        "title": "Logical Paths",
        "disabled": false,
        "reports": [
            {
                "title": "Paths from vulnerable hosts",
                "query": "MATCH p=shortestPath((c:Computer)-[r:FILTERED_EDGES*1..]->(m:Group)) \nWHERE c.is_vulnerable = true \nAND m.name IN $bluehound_ou_name\nAND NONE( rel in r WHERE type(rel)=\"Open\") \nRETURN p\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "Computer": "name",
                    "User": "name",
                    "Group": "name"
                },
                "settings": {
                    "nodePositions": {},
                    "hideSelections": true,
                    "frozen": false,
                    "layout": "tree-horizontal"
                },
                "refreshRate": "",
                "infoOpen": false,
                "queryInfo": "Paths to Domain Admins from hosts with critical vulnerabilities",
                "url": "dsa",
                "infoURL": ""
            },
            {
                "title": "Domain Admins w/sessions to non-DCs",
                "query": "MATCH p=(c:Computer)-[:HasSession]-(u:User)-[:MemberOf]-(g:Group)\nWHERE g.objectid =~ \"(?i)S-1-5-.*-512\" \nMATCH (c)-[:Contains]-(o:OU)\nWHERE NOT o.name IN $bluehound_ou_name\nreturn p\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "Computer": "name",
                    "User": "name",
                    "Group": "name"
                },
                "settings": {
                    "nodePositions": {
                        "1026": [
                            null,
                            null
                        ],
                        "2050": [
                            null,
                            null
                        ],
                        "2106": [
                            null,
                            null
                        ],
                        "2155": [
                            null,
                            null
                        ],
                        "2180": [
                            null,
                            null
                        ],
                        "2211": [
                            null,
                            null
                        ],
                        "2219": [
                            null,
                            null
                        ],
                        "2220": [
                            null,
                            null
                        ],
                        "2227": [
                            null,
                            null
                        ],
                        "2228": [
                            null,
                            null
                        ],
                        "2269": [
                            null,
                            null
                        ],
                        "2327": [
                            null,
                            null
                        ],
                        "2329": [
                            null,
                            null
                        ],
                        "2353": [
                            null,
                            null
                        ],
                        "2360": [
                            null,
                            null
                        ],
                        "2421": [
                            null,
                            null
                        ],
                        "2477": [
                            null,
                            null
                        ],
                        "2521": [
                            null,
                            null
                        ],
                        "2527": [
                            null,
                            null
                        ],
                        "2543": [
                            null,
                            null
                        ],
                        "2592": [
                            null,
                            null
                        ],
                        "2611": [
                            null,
                            null
                        ],
                        "2627": [
                            null,
                            null
                        ],
                        "2643": [
                            null,
                            null
                        ],
                        "2730": [
                            null,
                            null
                        ],
                        "2733": [
                            null,
                            null
                        ],
                        "2772": [
                            null,
                            null
                        ],
                        "2786": [
                            null,
                            null
                        ],
                        "2804": [
                            null,
                            null
                        ],
                        "2889": [
                            null,
                            null
                        ],
                        "2894": [
                            null,
                            null
                        ],
                        "2914": [
                            null,
                            null
                        ],
                        "2986": [
                            null,
                            null
                        ],
                        "3020": [
                            null,
                            null
                        ],
                        "3040": [
                            null,
                            null
                        ],
                        "3070": [
                            0,
                            34.465765959637444
                        ],
                        "3083": [
                            0,
                            -49.723502500910854
                        ],
                        "3100": [
                            0,
                            47.8815312438467
                        ],
                        "3128": [
                            0,
                            -3.9838829024912
                        ],
                        "3178": [
                            0,
                            -15.632223818540805
                        ],
                        "3181": [
                            0,
                            65.00904892285297
                        ],
                        "3291": [
                            0,
                            -39.51418279404342
                        ],
                        "3294": [
                            0,
                            19.22496498560307
                        ],
                        "3322": [
                            0,
                            11.48661111165329
                        ],
                        "3369": [
                            0,
                            -68.46383747445162
                        ],
                        "3436": [
                            0,
                            31.885969040792983
                        ],
                        "3448": [
                            0,
                            -21.654755790256793
                        ],
                        "3450": [
                            0,
                            -26.8048944532593
                        ],
                        "3473": [
                            0,
                            39.4675339063279
                        ],
                        "3517": [
                            0,
                            -62.37944379382314
                        ],
                        "3526": [
                            0,
                            31.232761335901415
                        ],
                        "3549": [
                            0,
                            3.6583396993642783
                        ],
                        "3554": [
                            0,
                            -74.79514431116276
                        ],
                        "3574": [
                            0,
                            61.61312263160997
                        ],
                        "3586": [
                            0,
                            -30.871083252750456
                        ],
                        "3634": [
                            0,
                            -0.9336979223927058
                        ],
                        "3659": [
                            0,
                            52.7322490200867
                        ],
                        "3665": [
                            0,
                            -73.4600273374376
                        ],
                        "3782": [
                            0,
                            94.73420162304427
                        ],
                        "3907": [
                            0,
                            -13.706196247159347
                        ],
                        "3937": [
                            0,
                            -55.47207786822671
                        ],
                        "3959": [
                            0,
                            85.90158092450557
                        ],
                        "3964": [
                            0,
                            -66.086706177839
                        ],
                        "4022": [
                            0,
                            41.90411124815092
                        ],
                        "4036": [
                            0,
                            17.21895370351494
                        ]
                    },
                    "hideSelections": true,
                    "frozen": false,
                    "layout": "tree-horizontal"
                },
                "infoOpen": false
            },
            {
                "title": "Shortest paths to Domain Admins",
                "query": "MATCH p=shortestPath((n)-[r:FILTERED_EDGES*1..]->(m:Group)) \nWHERE m.name IN $bluehound_group_name\nAND NOT n=m \nAND NONE( rel in r WHERE type(rel)=\"Open\") \nRETURN p\n\n\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "OU": "name",
                    "Computer": "name",
                    "User": "name",
                    "Group": "name",
                    "GPO": "name",
                    "Domain": "name",
                    "Container": "name"
                },
                "settings": {
                    "nodePositions": {},
                    "hideSelections": true,
                    "frozen": false,
                    "layout": "tree-horizontal"
                }
            },
            {
                "title": "Paths from Kerberoastable users",
                "query": "MATCH (u:User {hasspn:true}) \nMATCH (g:Group) \nWHERE g.name IN $bluehound_group_name \nMATCH p = shortestPath( (u)-[r*1..]->(g) )\nWHERE NONE( rel in r WHERE type(rel)=\"Open\")\nRETURN p\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "User": "name",
                    "Group": "name",
                    "Computer": "name"
                },
                "settings": {
                    "nodePositions": {},
                    "frozen": false,
                    "layout": "tree-horizontal"
                }
            },
            {
                "title": "Paths to Crown Jewels",
                "query": "MATCH p=allShortestPaths((n)-[:MemberOf|HasSession|AdminTo*1..]->(c:Computer)) \nWHERE NOT n=c\nAND c.name in $bluehound_computer_name\nRETURN p\n\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "User": "name",
                    "Group": "name",
                    "Computer": "name"
                },
                "settings": {
                    "nodePositions": {},
                    "frozen": false,
                    "layout": "tree-horizontal"
                }
            },
            {
                "title": "Ransomulator",
                "query": "ransomulator_Logical",
                "width": "4",
                "type": "ransomulator_line",
                "height": "3",
                "selection": {},
                "settings": {
                    "type": "Logical"
                }
            }
        ]
    },
    {
        "title": "Network-Enabled Paths",
        "disabled": false,
        "reports": [
            {
                "title": "Practical paths from vulnerable hosts",
                "query": "MATCH p=allShortestPaths((c:Computer)-[r*1..]->(m:Group)) \nWHERE c.is_vulnerable = true \nAND m.name IN $bluehound_group_name\nWITH nodes(p) as nds, p\nMATCH (src:Computer)-[:Open]->(trgt:Computer)\nMATCH (c:Computer)\nWHERE src IN nds AND trgt IN nds AND c IN nds\nWITH p,nds,c,src,trgt,reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN src THEN i ELSE ix END ) AS srcix, reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN trgt THEN i ELSE ix END ) AS trgtix\nWHERE trgtix > srcix\nWITH p,size(collect(DISTINCT c)) AS total_hosts, size(collect(DISTINCT trgt)) AS total_targets\nWHERE total_hosts = total_targets + 1\nRETURN p",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "Computer": "name",
                    "User": "name",
                    "Group": "name"
                },
                "settings": {
                    "nodePositions": {},
                    "hideSelections": true,
                    "frozen": false,
                    "layout": "tree-horizontal"
                },
                "refreshRate": "",
                "infoURL": "https://zeronetworks.com/blog/adversary-resilience-via-least-privilege-networking-part-2/",
                "queryInfo": "Shortest paths to Domain Admins, filtering out paths that are blocked by network segmentation",
                "infoOpen": false
            },
            {
                "title": "Practical paths to Domain Admins",
                "query": "MATCH p=allShortestPaths((n)-[:MemberOf|HasSession|AdminTo*1..]->(m:Group)) \nWHERE m.name IN $bluehound_group_name\nAND NOT n=m\nWITH nodes(p) as nds,p\nMATCH (src:Computer)-[:Open]->(trgt:Computer)\nMATCH (c:Computer)\nWHERE src IN nds AND trgt IN nds AND c IN nds\nWITH p,nds,c,src,trgt,reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN src THEN i ELSE ix END ) AS srcix, reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN trgt THEN i ELSE ix END ) AS trgtix\nWHERE trgtix > srcix\nWITH p,size(collect(DISTINCT c)) AS total_hosts, size(collect(DISTINCT trgt)) AS total_targets\nWHERE total_hosts = total_targets + 1\nRETURN p\n\n\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "Group": "name",
                    "Computer": "name",
                    "User": "name"
                },
                "settings": {
                    "nodePositions": {
                        "1026": [
                            7.0710678118654755,
                            0
                        ],
                        "1144": [
                            -9.03088751750192,
                            8.273032735715967
                        ],
                        "1249": [
                            1.3823220809823638,
                            -15.750847141167634
                        ],
                        "1361": [
                            11.382848792909423,
                            14.846910566099618
                        ],
                        "1373": [
                            -20.88892748977138,
                            -3.694957148205299
                        ],
                        "1456": [
                            19.78781566111266,
                            -12.587388583889217
                        ],
                        "1525": [
                            -6.618637082526906,
                            24.621000044064004
                        ],
                        "1638": [
                            -12.62245871740517,
                            -24.303776166007665
                        ],
                        "1678": [
                            27.3856864633483,
                            10.001208773502414
                        ],
                        "1689": [
                            -28.490243449190146,
                            11.760358336627238
                        ],
                        "1747": [
                            13.734179949820856,
                            -29.34914481047001
                        ],
                        "1774": [
                            10.149209636450301,
                            32.35727960993298
                        ],
                        "1786": [
                            -30.589835678756263,
                            -17.727435041389676
                        ],
                        "1999": [
                            35.88535934290564,
                            -7.889295585192323
                        ],
                        "2036": [
                            -21.900276194166445,
                            31.150889274934457
                        ],
                        "2061": [
                            -5.05947091685981,
                            -39.04358787357342
                        ],
                        "2106": [
                            31.060189025756014,
                            26.17756019349981
                        ],
                        "2111": [
                            -41.7972782028575,
                            1.7284486781313184
                        ],
                        "2114": [
                            30.487905903426476,
                            -30.339538454363694
                        ],
                        "2124": [
                            -2.039759023075995,
                            44.11166946656837
                        ],
                        "2135": [
                            -29.009340345864786,
                            -34.762884988127524
                        ],
                        "2211": [
                            45.95399818121157,
                            6.183045460062862
                        ],
                        "2219": [
                            -38.93672971725283,
                            27.09116237678997
                        ],
                        "2220": [
                            10.639754127738415,
                            -47.294773834973284
                        ],
                        "2227": [
                            24.609197771495488,
                            42.94633145035117
                        ],
                        "2228": [
                            -48.108627040199295,
                            -15.347964174671652
                        ],
                        "2235": [
                            46.73140878326114,
                            -21.591096154010888
                        ],
                        "2300": [
                            -20.24521394750863,
                            48.374903743776095
                        ],
                        "2327": [
                            -18.06840736265379,
                            -50.23477535907967
                        ],
                        "2353": [
                            48.07809275820085,
                            25.268498109975486
                        ],
                        "2389": [
                            -53.40266400194313,
                            14.076770847590282
                        ],
                        "2421": [
                            30.354442781599538,
                            -47.20813281012711
                        ],
                        "2446": [
                            9.655927474313346,
                            56.18507866516519
                        ],
                        "2474": [
                            -45.76062462351757,
                            -35.439599801147835
                        ],
                        "2477": [
                            58.536154406261204,
                            -4.849600738859532
                        ],
                        "2487": [
                            -40.46082171267107,
                            43.73696270130613
                        ],
                        "2527": [
                            0.2947222361892172,
                            -60.41451099531879
                        ],
                        "2536": [
                            41.144395618376954,
                            45.3556910342956
                        ],
                        "2563": [
                            -61.78358926815812,
                            -5.726089166572359
                        ],
                        "2584": [
                            50.06298462654409,
                            -37.99602045323181
                        ],
                        "2586": [
                            -11.390445481056078,
                            62.61196173051192
                        ],
                        "2611": [
                            -34.31071527657914,
                            -54.523158540289266
                        ],
                        "2655": [
                            62.87361064289961,
                            17.231050018065154
                        ],
                        "2679": [
                            -58.67884169898138,
                            30.113012749738004
                        ],
                        "2727": [
                            23.18893409286655,
                            -62.548168123748376
                        ],
                        "2730": [
                            25.432917514684455,
                            62.475328784178934
                        ],
                        "2733": [
                            -61.62111385388559,
                            -29.203395819775295
                        ],
                        "2772": [
                            65.86106411715086,
                            -20.305669980489306
                        ],
                        "2804": [
                            -35.212522419896,
                            60.08392684261177
                        ],
                        "2894": [
                            -14.77145920919575,
                            -68.78810938549674
                        ],
                        "2914": [
                            57.93418848256449,
                            41.15373379010332
                        ],
                        "2986": [
                            -71.21258889021408,
                            8.87508780538854
                        ],
                        "2987": [
                            46.96434097121082,
                            -55.17563481410839
                        ],
                        "3015": [
                            2.665591971922959,
                            73.09510667232944
                        ],
                        "3020": [
                            -51.81815656295746,
                            -52.58211340766771
                        ],
                        "3040": [
                            75.23088619229925,
                            47.33852121664796
                        ],
                        "3041": [
                            -57.94584908633828,
                            47.87774612137991
                        ],
                        "3070": [
                            10.478025809169152,
                            -75.10133803829586
                        ],
                        "3098": [
                            43.37639122203199,
                            62.995941810193024
                        ],
                        "3100": [
                            -75.17192175207843,
                            -17.296883537198195
                        ],
                        "3120": [
                            67.67494002540472,
                            -38.34191560887216
                        ],
                        "3128": [
                            -24.199351776809383,
                            74.59484817051532
                        ],
                        "3174": [
                            -32.80776754384704,
                            -71.92809179165603
                        ],
                        "3178": [
                            73.35806941917411,
                            31.122237244318303
                        ],
                        "3181": [
                            -75.7038706749832,
                            26.81275750133545
                        ],
                        "3210": [
                            38.00112135473939,
                            -71.45568399912193
                        ],
                        "3233": [
                            20.400746894112622,
                            78.95447755613581
                        ],
                        "3270": [
                            -68.88804500491484,
                            -44.77094208748379
                        ],
                        "3280": [
                            81.63631358910243,
                            -13.620290143081709
                        ],
                        "3291": [
                            -51.36658589269826,
                            65.66181427380795
                        ],
                        "3294": [
                            -6.524232846318406,
                            -83.71041981597642
                        ],
                        "3299": [
                            61.78996149066672,
                            57.72348446673958
                        ],
                        "3314": [
                            -85.14287924641151,
                            -0.8307307812929198
                        ],
                        "3322": [
                            63.77821116605043,
                            -57.29170778095798
                        ],
                        "3324": [
                            -8.384537640848643,
                            85.90517754215513
                        ],
                        "3335": [
                            -52.19241383102709,
                            -69.46907181250381
                        ],
                        "3369": [
                            85.97451880838744,
                            16.074268744370073
                        ],
                        "3398": [
                            -74.73668467093094,
                            46.52341307769494
                        ],
                        "3404": [
                            23.83469124336915,
                            -85.33409338203144
                        ],
                        "3417": [
                            40.321791005107514,
                            79.52454445100851
                        ],
                        "3436": [
                            -83.97329492050187,
                            -31.5988249812302
                        ],
                        "3527": [
                            83.7795653009197,
                            -33.63011207220298
                        ],
                        "3532": [
                            -39.29852881769943,
                            81.88788452979138
                        ],
                        "3549": [
                            -26.496096265793614,
                            -87.45259791837975
                        ],
                        "3574": [
                            79.08010012524043,
                            46.86510177287518
                        ],
                        "3586": [
                            -90.49891610470821,
                            18.97224772853719
                        ],
                        "3607": [
                            54.22989387987045,
                            -75.55870968841374
                        ],
                        "3634": [
                            11.115438344501243,
                            92.87866832814515
                        ],
                        "3649": [
                            -71.33900756564361,
                            -61.32492152093669
                        ],
                        "3669": [
                            94.55729014169245,
                            -2.986449574292769
                        ],
                        "3681": [
                            -68.08348195242905,
                            66.44275344409853
                        ],
                        "3731": [
                            5.350523786656618,
                            -95.50587361627777
                        ],
                        "3782": [
                            60.89805413593339,
                            74.44076169987062
                        ],
                        "3788": [
                            -95.70149029940134,
                            -13.828403901882153
                        ],
                        "3855": [
                            80.33443352607085,
                            -54.73918879601071
                        ],
                        "3884": [
                            -22.377789897465878,
                            95.12746458991155
                        ],
                        "3907": [
                            -48.00637868990163,
                            -85.70523674246375
                        ],
                        "3937": [
                            93.77359482802532,
                            30.92754295170151
                        ],
                        "3959": [
                            190.80256480528624,
                            -60.94749788943263
                        ],
                        "3964": [
                            39.405391604334184,
                            -91.63631983285377
                        ],
                        "3978": [
                            33.007763527292475,
                            94.65985182180637
                        ],
                        "3990": [
                            -88.71882907398403,
                            -47.738552216643605
                        ],
                        "4008": [
                            98.14536344682021,
                            -24.84929845874063
                        ],
                        "4022": [
                            -55.85435935400874,
                            85.03111513530358
                        ],
                        "4023": [
                            -16.330752093088236,
                            -100.91237057999427
                        ],
                        "4046": [
                            -18.535186615621,
                            -9.214714503951875
                        ]
                    },
                    "frozen": true,
                    "layout": "tree-horizontal"
                }
            },
            {
                "title": "Practical paths from Kerberoastable users",
                "query": "MATCH (u:User {hasspn:true}) \nMATCH (g:Group) \nWHERE g.name IN $bluehound_group_name \nMATCH p = allShortestPaths( (u)-[r:FILTERED_EDGES*1..]->(g) )\nWITH nodes(p) as nds,p\nMATCH (src:Computer)-[:Open]->(trgt:Computer)\nMATCH (c:Computer)\nWHERE src IN nds AND trgt IN nds AND c IN nds\nWITH p,nds,c,src,trgt,reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN src THEN i ELSE ix END ) AS srcix, reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN trgt THEN i ELSE ix END ) AS trgtix\nWHERE trgtix > srcix\nWITH p,size(collect(DISTINCT c)) AS total_hosts, size(collect(DISTINCT trgt)) AS total_targets\nWHERE total_hosts = total_targets + 1\nRETURN p\n\n\n\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "User": "name",
                    "Computer": "name",
                    "Group": "name"
                },
                "settings": {
                    "nodePositions": {},
                    "frozen": false,
                    "layout": "tree-horizontal"
                }
            },
            {
                "title": "Practical paths to Crown Jewels",
                "query": "MATCH p=allShortestPaths((n)-[:MemberOf|HasSession|AdminTo*1..]->(c:Computer)) \nWHERE NOT n=c\nAND c.name in $bluehound_computer_name\nWITH nodes(p) as nds,p\nMATCH (src:Computer)-[:Open]->(trgt:Computer)\nMATCH (c:Computer)\nWHERE src IN nds AND trgt IN nds AND c IN nds\nWITH p,nds,c,src,trgt,reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN src THEN i ELSE ix END ) AS srcix, reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN trgt THEN i ELSE ix END ) AS trgtix\nWHERE trgtix > srcix\nWITH p,size(collect(DISTINCT c)) AS total_hosts, size(collect(DISTINCT trgt)) AS total_targets\nWHERE total_hosts = total_targets + 1\nRETURN p\n\n",
                "width": "4",
                "type": "graph",
                "height": "3",
                "selection": {
                    "Base": "name",
                    "Computer": "name",
                    "User": "name",
                    "Group": "name"
                },
                "settings": {
                    "nodePositions": {},
                    "frozen": false,
                    "layout": "tree-horizontal"
                }
            },
            {
                "title": "Ransomulator - Practical",
                "query": "ransomulator_Practical",
                "width": 3,
                "type": "ransomulator_line",
                "height": 3,
                "selection": {},
                "settings": {
                    "type": "Practical"
                }
            }
        ]
    },
    {
        "title": "Statistics",
        "disabled": false,
        "reports": [
            {
                "title": "Users with most admin privs",
                "query": "MATCH p=shortestPath((u:User)-[:AdminTo|MemberOf*1..]->(c:Computer))\nRETURN u.name as User, count(c) as AdminTo\nORDER BY AdminTo DESC\nLIMIT 10",
                "width": 3,
                "type": "bar",
                "height": 3,
                "selection": {
                    "index": "User",
                    "value": "AdminTo",
                    "key": "(none)"
                },
                "settings": {
                    "legend": false,
                    "marginBottom": 100
                },
                "infoOpen": false,
                "queryInfo": "Counting the number of hosts each user is an administrator to"
            },
            {
                "title": "Users with most paths to hosts",
                "query": "MATCH p=ShortestPath((u:User)-[r:FILTERED_EDGES*1..]->(c:Computer))\nRETURN u.name as User, count(c) as AdminTo\nORDER BY AdminTo DESC\nLIMIT 10\n\n",
                "width": 3,
                "type": "bar",
                "height": 3,
                "selection": {
                    "index": "User",
                    "value": "AdminTo",
                    "key": "(none)"
                },
                "settings": {
                    "marginBottom": 100
                },
                "queryInfo": "Counting number of hosts each user has a path to"
            },
            {
                "title": "Users with most sessions",
                "query": "MATCH (c:Computer)-[:HasSession]->(u:User)\nRETURN u.name as User, count(c) as Sessions\nORDER BY Sessions DESC\nLIMIT 10\n\n\n",
                "width": 3,
                "type": "bar",
                "height": 3,
                "selection": {
                    "index": "User",
                    "value": "Sessions",
                    "key": "(none)"
                },
                "settings": {
                    "marginBottom": 100
                },
                "queryInfo": "Users with most active sessions to hosts"
            },
            {
                "title": "Hosts with most sessions",
                "query": "MATCH (c:Computer)-[:HasSession]->(u:User)\nRETURN c.name as Computer, count(u) as Sessions\nORDER BY Sessions DESC\nLIMIT 10\n\n\n",
                "width": 3,
                "type": "bar",
                "height": 3,
                "selection": {
                    "index": "Computer",
                    "value": "Sessions",
                    "key": "(none)"
                },
                "settings": {
                    "marginBottom": 100
                },
                "queryInfo": "Hosts which have most session of connected users "
            },
            {
                "title": "All vulnerable hosts",
                "query": "MATCH (c:Computer) \nWHERE c.is_vulnerable = true \nRETURN c.name as Computer, c.cves as CVEs\n",
                "width": 3,
                "type": "table",
                "height": 3,
                "selection": {},
                "settings": {}
            },
            {
                "title": "Admins w/sessions to non-DCs",
                "query": "MATCH (c:Computer)-[:HasSession]-(u:User)-[:MemberOf]-(g:Group)\nWHERE g.objectid =~ \"(?i)S-1-5-.*-512\" \nMATCH (c)-[:Contains]-(o:OU)\nWHERE NOT o.name IN $bluehound_ou_name\nRETURN u.name as User, COLLECT(DISTINCT c.name) as Computer",
                "width": 3,
                "type": "table",
                "height": 3,
                "selection": {},
                "settings": {}
            },
            {
                "title": "Kerberoastable Users ",
                "query": "MATCH (u:User) WHERE u.hasspn=true\nRETURN u.name as User\n",
                "width": 3,
                "type": "table",
                "height": 3,
                "selection": {},
                "settings": {},
                "queryInfo": "List of users that can be Kerberoasted",
                "infoOpen": false
            },
            {
                "title": "AS-REP Roastable Users",
                "query": "MATCH (u:User {dontreqpreauth: true}) RETURN u.name",
                "width": 3,
                "type": "table",
                "height": 3,
                "selection": {},
                "settings": {},
                "queryInfo": "Users that don't require pre-authentication, so their passwords can be cracked offline",
                "infoURL": "https://harmj0y.medium.com/roasting-as-reps-e6179a65216b",
                "infoOpen": false
            },
            {
                "title": "Hosts w/most admins + path to DA",
                "query": "MATCH p = (u1:User)-[r:MemberOf|AdminTo*1..]->(c:Computer)-[r2:HasSession]->(u2:User)-[r3:MemberOf*1..]->(g:Group)\nWHERE g.name IN $bluehound_group_name\nRETURN c.name as computerName, COUNT(DISTINCT(u1)) AS adminCount\nORDER BY adminCount DESC\nLIMIT 10\n\n",
                "width": 3,
                "type": "bar",
                "height": 3,
                "selection": {
                    "index": "computerName",
                    "value": "adminCount",
                    "key": "(none)"
                },
                "settings": {
                    "nodePositions": {}
                },
                "queryInfo": "Hosts that have a path to an admin account, and have many local administrators are more vulnerable to compromise"
            },
            {
                "title": "Hosts w/most admins",
                "query": "MATCH p = (u1:User)-[r:MemberOf|AdminTo*1..]->(c:Computer)\nRETURN c.name as computerName, COUNT(DISTINCT(u1)) AS adminCount\nORDER BY adminCount DESC\nLIMIT 10\n\n\n\n\n",
                "width": 3,
                "type": "bar",
                "height": 3,
                "selection": {
                    "index": "computerName",
                    "value": "adminCount",
                    "key": "(none)"
                },
                "settings": {
                    "nodePositions": {}
                },
                "queryInfo": "Hosts with many local admins are more likely to be compromised"
            },
            {
                "title": "Non-DCs where DA log into",
                "query": "MATCH (c2:Computer)-[r3:MemberOf*1..]->(g2:Group)\nWHERE g2.name IN $bluehound_ou_name\nWITH COLLECT(c2.name) as domainControllers\nMATCH (c1:Computer)-[r1:HasSession]->(u1:User)-[r2:MemberOf*1..]->(g1:Group)\nWHERE g1.name IN $bluehound_group_name\nAND NOT (c1.name IN domainControllers)\nRETURN DISTINCT(c1.name) as Computer\nORDER BY Computer ASC\n\n\n",
                "width": 3,
                "type": "table",
                "height": 3,
                "selection": {},
                "settings": {
                    "nodePositions": {}
                },
                "queryInfo": "It is bad practice for DA accounts to be logged on to hosts other than domain controllers"
            },
            {
                "title": "Node impact on paths",
                "query": "MATCH (m:User)\nMATCH p=allShortestPaths((m)-[r:FILTERED_EDGES*1..]->(n:Group)) \nWHERE n.name in $bluehound_group_name\nWITH collect (p) as paths, count(*) as path_count LIMIT 1000\nUNWIND paths as p \nWITH path_count, p, nodes(p) as nodes_in_paths ORDER BY LENGTH(p)\nUNWIND nodes_in_paths as node \nWITH node.name as Name, node.objectid as Sid, labels(node)[1] as Type, count(node) as Weight, round((count(node)  * 1.0 / path_count) * 100) as Impact, min(length(p)) as Minimum_Length\nWHERE NOT node.name IN $bluehound_group_name\nRETURN Name, Sid, Type, Weight, Impact, Minimum_Length\nORDER BY Impact DESC\n\n\n\n\n\n",
                "width": 3,
                "type": "table",
                "height": 3,
                "selection": {},
                "settings": {},
                "infoURL": "https://insinuator.net/2019/10/blue-hands-on-bloodhound/",
                "queryInfo": "Calculating the impact score of different nodes along the path to DA",
                "infoOpen": false
            }
        ]
    },
    {
        "title": "Scores",
        "disabled": false,
        "reports": [
            {
                "title": "Percentage of Practical Paths",
                "query": "MATCH p=allShortestPaths((n)-[:DEFAULTEDGES*1..]->(m:Group)) WHERE m.name in $bluehound_group_name AND NOT n=m\nWITH nodes(p) as nds,p,count(p) AS total_paths\nMATCH (src:Computer)-[:Open]->(trgt:Computer)\nMATCH (c:Computer)\nWHERE src IN nds AND trgt IN nds AND c IN nds\nWITH total_paths,p,nds,c,src,trgt,reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN src THEN i ELSE ix END ) AS srcix, reduce(ix = -1, i IN RANGE(0,SIZE(nds)-1) | CASE nds[i] WHEN trgt THEN i ELSE ix END ) AS trgtix\nWHERE trgtix > srcix\nWITH total_paths,p,size(collect(DISTINCT c)) AS total_hosts, size(collect(DISTINCT trgt)) AS total_targets\nWHERE total_hosts = total_targets + 1\nWITH count(p) AS practical_paths,total_paths\nRETURN (CASE WHEN practical_paths <> 0 THEN round(toFloat(practical_paths) /total_paths) ELSE 0 END) AS value",
                "width": "3",
                "type": "gauge",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "minValue": 0,
                    "maxValue": 100,
                    "barValues": true,
                    "enableGridY": false,
                    "hideSelections": false,
                    "animate": true,
                    "borderWidth": 2,
                    "colors": "set2",
                    "axisBottom": false,
                    "borderRadius": 5,
                    "scoreColors": true
                },
                "infoURL": "https://zeronetworks.com/blog/adversary-resilience-via-least-privilege-networking-part-2/",
                "queryInfo": "Percentage of practical paths to a domain admin as a measure of resilience",
                "infoOpen": false
            },
            {
                "title": "Vulnerable Hosts",
                "query": "MATCH (v:Computer)\nWHERE v.is_vulnerable = true\nWITH count(v) as vulnerable_hosts\nMATCH (c:Computer)\nWITH count(c) as total_hosts, vulnerable_hosts\nRETURN (CASE WHEN vulnerable_hosts <> 0 THEN round(100.0 * vulnerable_hosts / total_hosts) ELSE 0 END) as value",
                "width": "3",
                "type": "gauge",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "minValue": 0,
                    "maxValue": 100,
                    "barValues": true,
                    "enableGridY": false,
                    "animate": true,
                    "borderWidth": 2,
                    "borderRadius": 5,
                    "axisBottom": false,
                    "scoreColors": true
                },
                "queryInfo": "Percentage of hosts with critical vulnerabilities",
                "infoOpen": false
            },
            {
                "title": "Users with Paths to DA",
                "query": "MATCH (totalUsers:User)\nMATCH p = shortestPath((pathToDAUsers:User )-[r:FILTERED_EDGES*1..]->(g:Group))\nWHERE g.name in $bluehound_group_name\nAND NONE( rel in r WHERE type(rel)=\"Open\") \nWITH COUNT(DISTINCT(totalUsers)) as totalUsers, COUNT(DISTINCT(pathToDAUsers)) as pathToDAUsers\nRETURN (CASE WHEN pathToDAUsers <> 0 THEN round(100.0 * pathToDAUsers / totalUsers) ELSE 0 END) AS value",
                "width": "3",
                "type": "gauge",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "minValue": 0,
                    "maxValue": 100,
                    "barValues": true,
                    "enableGridY": false,
                    "animate": true,
                    "borderWidth": 2,
                    "borderRadius": 5,
                    "axisBottom": false,
                    "scoreColors": true
                },
                "infoURL": "https://posts.specterops.io/introducing-the-adversary-resilience-methodology-part-two-279a1ed7863d",
                "queryInfo": "Percentage of users with a path to Domain Admins",
                "infoOpen": false
            },
            {
                "title": "Computers with Paths to DA",
                "query": "MATCH (totalComputers:Computer)\nMATCH p = shortestPath((pathToDAComputers:Computer)-[r:FILTERED_EDGES*1..]->(g:Group))\nWHERE g.name in $bluehound_group_name\nAND NONE( rel in r WHERE type(rel)=\"Open\") \nWITH COUNT(DISTINCT(totalComputers)) as totalComputers, COUNT(DISTINCT(pathToDAComputers)) as pathToDAComputers\nRETURN (CASE WHEN pathToDAComputers <> 0 THEN round(100.0 * pathToDAComputers / totalComputers) ELSE 0 END) AS value\n\n\n",
                "width": "3",
                "type": "gauge",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "minValue": 0,
                    "maxValue": 100,
                    "barValues": true,
                    "enableGridY": false,
                    "animate": true,
                    "borderWidth": 2,
                    "borderRadius": 5,
                    "scoreColors": true,
                    "axisBottom": false
                },
                "infoURL": "https://posts.specterops.io/introducing-the-adversary-resilience-methodology-part-two-279a1ed7863d",
                "queryInfo": "Percentage of computers with a path to Domain Admins",
                "infoOpen": false
            },
            {
                "title": "Average path length",
                "query": "MATCH p = shortestPath((n)-[r:FILTERED_EDGES*1..]->(g:Group))\nWHERE g.name in $bluehound_group_name\nAND NOT n=g\nAND NONE( rel in r WHERE type(rel)=\"Open\") \nRETURN round(AVG(LENGTH(p))) as avgPathLength\n\n\n\n\n\n",
                "width": "3",
                "type": "value",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "textAlign": "left",
                    "color": "rgba(0,128,128,1)"
                },
                "infoURL": "https://posts.specterops.io/introducing-the-adversary-resilience-methodology-part-two-279a1ed7863d",
                "queryInfo": "Average attack path length",
                "infoOpen": false
            },
            {
                "title": "Direct Domain Admins Members",
                "query": "MATCH (m:User) MATCH (m)-[r:MemberOf*1]->(n:Group)\nWHERE n.name in $bluehound_group_name\nRETURN COUNT(m) as direct_member_count\n\n\n\n\n\n",
                "width": "3",
                "type": "value",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "color": "rgba(0,128,128,1)"
                }
            },
            {
                "title": "Nested Domain Admins Members",
                "query": "MATCH (m:User) MATCH (m)-[r:MemberOf*1..]->(n:Group)\nWHERE n.name IN $bluehound_group_name\nRETURN COUNT(m) as nested_member_count\n",
                "width": "3",
                "type": "value",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "color": "rgba(0,128,128,1)"
                },
                "queryInfo": "Total Domain Admin members (including group members)",
                "infoOpen": false
            },
            {
                "title": "Effective Domain Admins",
                "query": "MATCH p = (u1:User)-[r:MemberOf|AdminTo*1..]->(c:Computer)-[r2:HasSession]->(u2:User)-[r3:MemberOf*1..]->(g:Group)\nWHERE g.name IN $bluehound_group_name\nRETURN COUNT(DISTINCT(u1)) AS adminCount",
                "width": "3",
                "type": "value",
                "height": "1.25",
                "selection": {},
                "settings": {},
                "queryInfo": "Total count of effective Domain Admins (users with admin privileges on hosts with Domain Admins sessions).",
                "infoURL": "https://posts.specterops.io/introducing-the-adversary-resilience-methodology-part-two-279a1ed7863d",
                "infoOpen": false
            }
        ]
    },
    {
        "title": "Configurations",
        "disabled": false,
        "reports": [
            {
                "title": "Domain Controllers",
                "query": "MATCH (n:`OU`) \nWHERE toLower(toString(n.`name`)) CONTAINS toLower($input) \nRETURN DISTINCT n.`name` as value LIMIT 5",
                "width": "3",
                "type": "multiselect",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "type": "Node Property",
                    "entityType": "OU",
                    "propertyType": "name",
                    "parameterName": "bluehound_ou_name",
                    "helperText": "Domain Controllers OU Name"
                }
            },
            {
                "title": "Domain Admins Group",
                "query": "MATCH (n:`Group`) \nWHERE toLower(toString(n.`name`)) CONTAINS toLower($input) \nRETURN DISTINCT n.`name` as value LIMIT 5",
                "width": "3",
                "type": "multiselect",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "type": "Node Property",
                    "entityType": "Group",
                    "propertyType": "name",
                    "parameterName": "bluehound_group_name",
                    "manualPropertyNameSpecification": false,
                    "helperText": "Domain Admins Group Name"
                },
                "infoOpen": false
            },
            {
                "title": "Crown Jewels",
                "query": "MATCH (n:`Computer`) \nWHERE toLower(toString(n.`name`)) CONTAINS toLower($input) \nRETURN DISTINCT n.`name` as value LIMIT 5",
                "width": "3",
                "type": "multiselect",
                "height": "1.25",
                "selection": {},
                "settings": {
                    "nodePositions": {},
                    "type": "Node Property",
                    "entityType": "Computer",
                    "propertyType": "name",
                    "parameterName": "bluehound_computer_name"
                }
            }
        ]
    }
]

export const PAGE_INITIAL_STATE = {
    "title": "",
    "reports": []
}

/**
 * Swaps two elements in the reports array.
 */
function swapTwoCardsInPage(cards, fromIndex, toIndex) {
    // If the indices are the same, just return the same array.
    if (fromIndex === toIndex) {
        return cards;
    }
    cards.splice(fromIndex, 1, cards.splice(toIndex, 1, cards[fromIndex])[0]);

    // We make sure that the transition is temporarily disabled for both cards.
    cards[fromIndex].collapseTimeout = 0
    cards[toIndex].collapseTimeout = 0

    return cards;
}

/**
 * Reducers define changes to the application state when a given action.
 * This reducer handles updates to a single page of the dashboard.
 * TODO - pagenumbers can be cut from here with new reducer architecture.
 */
export const pageReducer = (state = PAGE_INITIAL_STATE, action: { type: any; payload: any; }) => {
    const { type, payload } = action;

    if (!action.type.startsWith('PAGE/')) {
        return state;
    }
    // Updates a report at a given page and index.
    if (action.type.startsWith('PAGE/CARD/')) {
        const { pagenumber, index, report } = payload;
        return {
            ...state,
            reports: [
                ...state.reports.slice(0, index),
                cardReducer(state.reports[index], action),
                ...state.reports.slice(index + 1)
            ]
        }
    }

    // Else, deal with page-level operations.
    switch (type) {
        case CREATE_REPORT: {
            // Adds a new card at the end of the page with selected page number.
            const { pagenumber, report } = payload;
            return {
                ...state,
                reports: state.reports.concat(report)
            }
        }
        case REMOVE_REPORT: {
            // Removes the card at a given index on a selected page number. 
            const { pagenumber, index } = payload;
            const cardsInFront = state.reports.slice(0, index);
            const cardsBehind = state.reports.slice(index + 1);

            // if there's card after the removed card, it will take it's place. 
            // We make sure that the transition is disabled in this case.
            if (cardsBehind.length > 0) {
                // @ts-ignore
                cardsBehind[0].collapseTimeout = 0;
            }

            return {
                ...state,
                reports: cardsInFront.concat(cardsBehind)
            }
        }
        case SHIFT_REPORT_LEFT: {
            // Moves a card left (swaps it with the previous card)
            const { pagenumber, index } = payload;

            return {
                ...state,
                reports: swapTwoCardsInPage(state.reports, index, Math.max(0, index - 1))
            }
        }
        case SHIFT_REPORT_RIGHT: {
            // Moves a card right (swaps it with the next card)
            const { pagenumber, index } = payload;
            return {
                ...state,
                reports: swapTwoCardsInPage(state.reports, index, Math.min(state.reports.length - 1, index + 1))
            }
        }
        case SET_PAGE_TITLE: {
            // Moves a card right (swaps it with the next card)
            const { pagenumber, title } = payload;
            return {
                ...state,
                title: title
            }
        }
        case FORCE_REFRESH_PAGE: {
            // We force a page refresh by resetting the field set for each report. (workaround)
            const { pagenumber } = payload;
            return {
                ...state,
                reports: state.reports.map(report => update(report, { fields: report.fields.concat([""]) }))
            }
        }
        default: {
            return state;
        }
    }
}