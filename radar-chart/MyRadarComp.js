import React from 'react';

import RadarChart from 'react-svg-radar-chart';
// import 'react-svg-radar-chart/build/css/index.css'

export default class MyRadarComp extends React.Component {
  render() {
    const tooltipstyle = {
        position: 'relative',
        display: 'inline-block',
        borderBottom: '1px dotted black'
    }

    const tooltiptextstyle = {
        visibility: 'hidden',
        width: '220px',
        backgroundColor: 'black',
        color: '#fff',
        textAlign: 'center',
        borderRadius: '6px',
        padding: '5px 0',

        /* Position the tooltip */
        position: 'absolute',
        zIndex: '1',
    }

 	 const data = [
      {
        data: {
          battery: 0.5,
          design: .7,
          useful: 0.985,
          speed: 0.57,
          weight: 0.7
        },
        meta: { color: 'blue' }
      },
      {
        data: {
          battery: 0.6,
          design: .85,
          useful: 0.5,
          speed: 0.6,
          weight: 0.7
        },
        meta: { color: 'red' }
      },
      {
            data: {
              battery: 0.7,
              design: .8,
              useful: 0.9,
              speed: 0.67,
              weight: 0.8
            },
            meta: { color: '#58FCEC' }
        }
    ];

    const captions = {
      // columns
      battery: 'Battery Capacity',
      design: 'Design',
      useful: 'Usefulness',
      speed: 'Speed',
      weight: 'Weight'
    };

    const noSmoothing = points => {
        let d = 'M' + points[0][0].toFixed(4) + ',' + points[0][1].toFixed(4);
        for (let i = 1; i < points.length; i++) {
          d += 'L' + points[i][0].toFixed(4) + ',' + points[i][1].toFixed(4);
        }
        return d + 'z';
      };

      const defaultOptions = {
        size: 200,
        axes: true, // show axes?
        scales: 3, // show scale circles?
        captions: true, // show captions?
        captionMargin: 10,
        dots: true, // show dots?
        zoomDistance: 1.2, // where on the axes are the captions?
        setViewBox: (options) => `-${options.captionMargin} 0 ${options.size + options.captionMargin * 2} ${options.size}`, // custom viewBox ?
        smoothing: noSmoothing, // shape smoothing function
        axisProps: () => ({ className: 'axis' }),
        scaleProps: () => ({ className: 'scale', fill: 'none' }),
        shapeProps: () => ({ className: 'shape' }),
        captionProps: () => ({
          className: 'caption',
          textAnchor: 'middle',
          fontSize: 10,
          fontFamily: 'sans-serif'
        }),
        dotProps: () => ({
          className: 'dot',
          mouseEnter: (dot) => {
              document.getElementById("tooltip").innerText = "index: " + dot.idx + ", key: " + dot.key + ", value: " + dot.value;
              document.getElementById("tooltip").style.visibility = "visible";
            },
          mouseLeave: (dot) => {
              document.getElementById("tooltip").innerText = "";
              document.getElementById("tooltip").style.visibility = "hidden";
            }
        })
      };

    return (
      <div>
        <RadarChart
            captions={{
              // columns
              battery: 'Battery Capacity',
              design: 'Design',
              useful: 'Usefulness',
              speed: 'Speed',
              weight: 'Weight'
            }}
            data={data}
            size={400}
            options={defaultOptions}
          />
          <div id="divtool" style={tooltipstyle}><label id="tooltip" style={tooltiptextstyle}></label></div>
        </div>
    );
  }
}
