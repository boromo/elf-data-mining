require('normalize.css/normalize.css');
require('../styles/App.css');

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

class Chart extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var dom =  ReactDOM.findDOMNode(this);
        // this.initD3Chart(dom, this.props.data);
        this.initCanvasChart(dom, this.props.data);
    }
    shouldComponentUpdate() {
        var dom =  ReactDOM.findDOMNode(this);
        // this.initD3Chart(dom, this.props.data);
        this.initCanvasChart(dom, this.props.data);
        return false;
    }

    componentWillUnmount() {
        // Clean up D3 after unmount
        d3.timerFlush();
        d3.select(ReactDOM.findDOMNode(this)).remove();
    }

    initCanvasChart(dom, root) {
        const width = 1200;
        const height = 700;

        const centerX = width/2;
        const centerY = height/2;

        //Create the visible canvas and context
        const canvas  = d3.select(dom).append('canvas')
            .attr('id', 'canvas')
            .attr('width', width)
            .attr('height', height);
        const context = canvas.node().getContext('2d');
        context.clearRect(0, 0, width, height);

        //Create a hidden canvas in which each circle will have a different color
        //We can use this to capture the clicked on circle
        const hiddenCanvas  = d3.select(dom).append('canvas')
            .attr('id', 'hiddenCanvas')
            .attr('width', width)
            .attr('height', height)
            .style('display','none');
        const hiddenContext = hiddenCanvas.node().getContext('2d');
        hiddenContext.clearRect(0, 0, width, height);

        // SCALES
        const colorCircle = d3.scale.ordinal()
            .domain([0,1,2,3])
            .range(['#bfbfbf','#838383','#4c4c4c','#1c1c1c']);

        const diameter = Math.min(width*0.9, height*0.9);

        const zoomInfo = {
            centerX: width / 2,
            centerY: height / 2,
            scale: 1
        };

        //Dataset to swtich between color of a circle (in the hidden canvas) and the node data
        const colToCircle = {};

        const pack = d3.layout.pack()
            .padding(1)
            .size([diameter, diameter])
            .value(function(d) { return d.size; })
            .sort(function(d) { return d.ID; });

        const nodes = pack.nodes(root);
        let focus = root;

        // CANVAS DRAW

        const cWidth = canvas.attr('width');
        const cHeight = canvas.attr('height');
        const nodeCount = nodes.length;

        //The draw function of the canvas that gets called on each frame
        const drawCanvas = (chosenContext, hidden) => {
            //Clear canvas
            chosenContext.fillStyle = '#fff';
            chosenContext.rect(0,0,cWidth,cHeight);
            chosenContext.fill();

            //Select our dummy nodes and draw the data to canvas.
            let node = null;

            // It's slightly faster than nodes.forEach()
            for (let i = 0; i < nodeCount; i++) {
                node = nodes[i];

                //If the hidden canvas was send into this function and it does not yet have a color, generate a unique one
                if(hidden) {
                    if(node.color == null) {
                        // If we have never drawn the node to the hidden canvas get a new color for it and put it in the dictionary.
                        node.color = genColor();
                        colToCircle[node.color] = node;
                    }//if
                    // On the hidden canvas each rectangle gets a unique color.
                    chosenContext.fillStyle = node.color;
                } else {
                    chosenContext.fillStyle = node.children ? colorCircle(node.depth) : 'white';
                }//else

                //Draw each circle
                chosenContext.beginPath();
                chosenContext.arc(((node.x - zoomInfo.centerX) * zoomInfo.scale) + centerX,
                    ((node.y - zoomInfo.centerY) * zoomInfo.scale) + centerY,
                    node.r * zoomInfo.scale, 0,  2 * Math.PI, true);
                chosenContext.fill();
            } // for i
        }

        // Listen for clicks on the main canvas
        document.getElementById('canvas').addEventListener('click', (e) => {
            const node = getColBasedOnPosition(e);
            if (node) {
                if (focus !== node) zoomToCanvas(node); else zoomToCanvas(root);
            }
        });

        document.getElementById('canvas').addEventListener('mousemove', (e) =>{
            const node = getColBasedOnPosition(e);
            console.log(node);
        }, false);

        const getColBasedOnPosition = (e) => {
            // We actually only need to draw the hidden canvas when there is an interaction.
            // This sketch can draw it on each loop, but that is only for demonstration.
            drawCanvas(hiddenContext, true);

            //Figure out where the mouse click occurred.
            const mouseX = e.layerX;
            const mouseY = e.layerY;

            // Get the corresponding pixel color on the hidden canvas and look up the node in our map.
            // This will return that pixel's color
            const col = hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
            //Our map uses these rgb strings as keys to nodes.
            const colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            const node = colToCircle[colString];

            return node || false;
        };

        //Based on the generous help by Stephan Smola
        //http://bl.ocks.org/smoli/d7e4f9199c15d71258b5

        const ease = d3.ease('cubic-in-out');
        let timeElapsed = 0;
        let vOld = [focus.x, focus.y, focus.r * 2.05];
        let interpolator = null;
        let duration = 2000;

        //Create the interpolation function between current view and the clicked on node
        function zoomToCanvas(focusNode) {
            focus = focusNode;
            var v = [focus.x, focus.y, focus.r * 2.05]; //The center and width of the new 'viewport'

            interpolator = d3.interpolateZoom(vOld, v); //Create interpolation between current and new 'viewport'

            duration = 	interpolator.duration; //Interpolation gives back a suggested duration
            timeElapsed = 0; //Set the time elapsed for the interpolateZoom function to 0
            vOld = v; //Save the 'viewport' of the next state as the next 'old' state
        }

        //Perform the interpolation and continuously change the zoomInfo while the 'transition' occurs
        function interpolateZoom(dt) {
            if (interpolator) {
                timeElapsed += dt;
                var t = ease(timeElapsed / duration);

                zoomInfo.centerX = interpolator(t)[0];
                zoomInfo.centerY = interpolator(t)[1];
                zoomInfo.scale = diameter / interpolator(t)[2];

                if (timeElapsed >= duration) interpolator = null;
            }//if
        }

        //Generates the next color in the sequence, going from 0,0,0 to 255,255,255.
        //From: https://bocoup.com/weblog/2d-picking-in-canvas
        let nextCol = 1;
        function genColor(){
            var ret = [];
            // via http://stackoverflow.com/a/15804183
            if(nextCol < 16777215){
                ret.push(nextCol & 0xff); // R
                ret.push((nextCol & 0xff00) >> 8); // G
                ret.push((nextCol & 0xff0000) >> 16); // B

                nextCol += 100; // This is exagerated for this example and would ordinarily be 1.
            }
            var col = 'rgb(' + ret.join(',') + ')';
            return col;
        }

        var dt = 0;
        d3.timer(function(elapsed) {
            interpolateZoom(elapsed - dt);
            dt = elapsed;
            drawCanvas(context);
        });
        zoomToCanvas(root);
    }

    render() {
        return (
            <div id="char"></div>
        );
    }
}

Chart.defaultProps = {
    data: {}
};
Chart.propTypes = {
    data: PropTypes.object.isRequired
};

export default Chart;
