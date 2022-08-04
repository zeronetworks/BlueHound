import React, { Component } from 'react';
import Lottie from 'react-lottie-player';
import lottieJson from '../../public/hound_animation.json'

class LoadingAnimation extends Component {
    render() {
        return (
            <Lottie
                loop
                animationData={lottieJson}
                play
                style={{ width: 200, height: 200, marginLeft: "auto", marginRight: "auto", marginTop: -60 }}
            />
        )
    }
}

export default LoadingAnimation;
