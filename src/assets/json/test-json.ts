export default {
    "attrs": {"width": 1000, "height": 1000},
    "className": "Stage",
    "children": [{
        "attrs": {},
        "className": "Layer",
        "children": [{
            "attrs": {
                "width": 1000,
                "height": 1000,
                "name": "image",
                "0q9u0o2c2k2h3a1n1h958": "image",
                "id": "shit",
                "source": "http://localhost:3000/image_background/background-1.png"
            }, "className": "Image"
        }, {"attrs": {"keepRatio": false}, "className": "Transformer"}, {
            "attrs": {
                "text": "Hehe",
                "x": 209,
                "y": 126,
                "fontSize": 20,
                "draggable": true,
                "width": 200,
                "id": "name",
                "0q9u0o2c2k2h3a1n1h958": "text",
                "fill": "black"
            }, "className": "Text"
        }, {
            "attrs": {"enabledAnchors": ["middle-left", "middle-right"], "x": 202, "y": 123},
            "className": "Transformer"
        }]
    }]
}