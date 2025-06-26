'use client';

import React, { useState, useEffect } from 'react';

// Interfaces and Data
interface PortfolioLayer {
    id: string;
    title: string;
    layer: string;
    description: string;
    icon: string;
}

const portfolioLayers: PortfolioLayer[] = [
    { id: "network", title: "Networks & Connectivity", layer: "Layer #0", description: "Core networking infrastructure and connectivity solutions.", icon: "/icons/network-red.svg" },
    { id: "platform", title: "MCX ONE™ Platform", layer: "Layer #1", description: "Unified communication platform enabling mission-critical services.", icon: "/icons/platform-red.svg" },
    { id: "devices", title: "Devices", layer: "Layer #2", description: "Smart devices and IoT endpoints integration.", icon: "/icons/devices-red.svg" },
    { id: "extensions", title: "Extensions", layer: "Layer #3", description: "Custom extensions and third-party integrations.", icon: "/icons/extensions-red.svg" },
    { id: "apps", title: "Apps & SDKs", layer: "Layer #4", description: "Development tools and APIs for rapid application development.", icon: "/icons/sdk-red.svg" }
];

// Helper functions based on TechStackCube
const getZPosition = (index: number) => -16 - (index * 48);

const getStaticCastShadow = (isCurrent: boolean) => {
    // if (!isCurrent) return '0 2px 4px rgba(0, 0, 0, 0.08)';
    // return '8px 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
};

const getStaticFaceStyle = (face: 'left' | 'right', isCurrent: boolean) => {
    const opacity = isCurrent ? 1 : 0.95;
    if (face === 'left') {
        return {
            backgroundColor: '#f5f5f5',
            color: `rgba(0, 0, 0, ${opacity})`,
            boxShadow: 'inset -1px 0 2px rgba(0, 0, 0, 0.1)'
        };
    }
    return {
        backgroundColor: '#d4d4d4',
        color: `rgba(0, 0, 0, ${opacity})`,
        boxShadow: 'inset 1px 0 3px rgba(0, 0, 0, 0.2)'
    };
};

export default function PortfolioStack() {
    const [currentLayerIndex, setCurrentLayerIndex] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    const [isInteracted, setIsInteracted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isHovered || isInteracted) return;
        const interval = setInterval(() => {
            setCurrentLayerIndex((prev) => (prev + 1) % portfolioLayers.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isHovered, isInteracted]);

    const handleLayerClick = (index: number) => {
        setIsInteracted(true);
        setCurrentLayerIndex(index);
    };

    const currentLayer = portfolioLayers[currentLayerIndex];

    return (
        <>
            <div className="portfolio-stack-container ">
                <div 
                    className="cube-container"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="perspective">
                        <div className="cube">
                            {portfolioLayers.map((layer, index) => {
                                const isCurrent = index === currentLayerIndex;

                                const transform = isCurrent
                                    ? isMobile
                                        ? `translate3d(0, -20px, ${getZPosition(index)}px) scale(0.8, 0.8)`
                                        : `translate3d(100%, 0px, ${getZPosition(index)}px) scale(0.8, 0.8)`
                                    : `translate3d(0px, 0px, ${getZPosition(index)}px) scale(0.8, 0.8)`;

                                return (
                                    <div
                                        key={layer.id}
                                        className="cube-section"
                                        style={{ transform }}
                                        onClick={() => handleLayerClick(index)}
                                    >
                                        <div 
                                            className="cube-section-top" 
                                            style={{ 
                                                backgroundImage: `url(${layer.icon})`,
                                                filter: isCurrent ? 'grayscale(0)' : 'grayscale(1)',
                                                opacity: isCurrent ? 1 : 0.5
                                            }} 
                                        />
                                        <div className="cube-section-left" style={getStaticFaceStyle('left', isCurrent)}>{layer.title}</div>
                                        <div className="cube-section-right" style={getStaticFaceStyle('right', isCurrent)}>{layer.layer}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="controls-container">
                    <div className="layer-info">
                        <h3 className="text-heading-3 text-consort-blue font-heading-1 mb-2">{currentLayer.title}</h3>
                        {/* <p className="info-subtitle text-brand-50 font-body ">{currentLayer.layer}</p> */}
                        <p className="info-description !text-neutral-500 font-body ">{currentLayer.description}</p>
                    </div>
                    <div className="layer-navigation">
                        {portfolioLayers.map((layer, index) => (
                            <button
                                key={layer.id}
                                className={`nav-button text-caption font-body ${index === currentLayerIndex ? 'active' : ''}`}
                                onClick={() => handleLayerClick(index)}
                            >
                                {layer.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .portfolio-stack-container {
                    display: flex;
                    border-radius: 20px;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    padding: 4rem 1rem;
                    // background-color:rgb(0, 40, 80);
                    overflow: hidden;
                }
                .cube-container {
                    position: relative;
                    height: 600px;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: top;
                    margin-bottom: -2rem;
                    overflow: visible;
                }
                .perspective {
                    position: relative;
                    height: 16rem;
                    width: 16rem;
                    transform: rotateX(55deg) rotateZ(45deg);
                    transform-style: preserve-3d;
                }
                .cube {
                    position: relative;
                    height: 100%;
                    width: 100%;
                    transform-style: preserve-3d;
                }
                .cube-section {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    background-color: #fff;
                    transform-style: preserve-3d;
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
                    cursor: pointer;
                    pointer-events: all;
                    border: 1px solid #e2e8f0;
                    shape-rendering: auto;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                    backface-visibility: hidden;
                }
                .cube-section-top {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    background-position: 50%;
                    background-repeat: no-repeat;
                    background-size: 40%;
                    transform: scale(1);
                    transition: background-size 0.2s ease, opacity 0.3s ease;
                    opacity: 1;
                    pointer-events: all;
                    display: grid;
                    align-items: center;
                    justify-content: center;
                    background-color: #fff;
                    // border: 1px solid #e2e8f0;
                    shape-rendering: auto;
                }
                .cube-section-left {
                    position: absolute;
                    height: 20%;
                    width: 100%;
                    margin-top: 80%;
                    font-family: "Manrope", Helvetica, Arial, sans-serif;
                    font-size: 1.1rem;
                    font-weight: 500;
                    color:rgb(0, 53, 105);
                    letter-spacing:0.025em;
                    transform: rotateX(-90deg) translateY(calc(100% - 1px));
                    transform-origin: 100% 100%;
                    display: grid;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
                    user-select: none;
                    padding: 0 0.5rem;
                    // border: 1px solid #e2e8f0;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                    shape-rendering: auto;
                }
                .cube-section-right {
                    position: absolute;
                    height: 20%;
                    width: calc(100% + 1px);
                    margin-top: 100%;
                    margin-left: -2px;
                    font-family: "Manrope", Helvetica, Arial, sans-serif;
                    color:rgb(119, 119, 119)!important;
                    font-size: 0.8rem;
                    
                    letter-spacing:0.15em;
                    font-weight: 600;
                    text-transform: uppercase;
                    transform: rotateY(90deg) rotateZ(-90deg) translateX(100%);
                    transform-origin: 100% 0;
                    display: grid;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
                    user-select: none;
                    padding: 0 0.5rem;
                    // border: 1px solid #e2e8f0;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                    shape-rendering: auto;
                }
                .controls-container {
                    width: 100%;
                    max-width: 600px;
                    text-align: center;
                }
                .layer-info {
                    margin-bottom: 2rem;
                }
                .info-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                }
                .info-subtitle {
                    font-size: 1rem;
                    font-weight: 500;
                    color:rgb(182, 193, 209);
                    margin-bottom: 0.5rem;
                }
                .info-description {
                    font-size: 1.125rem;
                    color:rgb(207, 207, 207);
                    line-height: 1.6;
                }
                .layer-navigation {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .nav-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 9999px;
                    background-color: #ffffff;
                    color: #4b5563;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                .nav-button:hover {
                    background-color: #f3f4f6;
                    // border-color: #9ca3af;
                }
                .nav-button.active {
                    background-color: #1e3a8a;
                    color: #ffffff;
                    // border-color:rgb(244, 255, 223);
                }
            `}</style>
        </>
    );
} 