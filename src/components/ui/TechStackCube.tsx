'use client';

import React, { useState, useEffect } from 'react';

interface StackLayer {
    id: string;
    title: string;
    layer: string;
    enabled: boolean;
    description?: string;
    icon?: string;
}

interface TechStackCubeProps {
    className?: string;
    autoRotate?: boolean;
    rotationInterval?: number;
}

const defaultLayers: StackLayer[] = [
    {
        id: "ai-applications",
        title: "Network & Connectivity",
        layer: "Layer #0",
        enabled: true,
        description: "Core networking infrastructure and connectivity solutions",
        icon: "/network-red.svg"
    },
    {
        id: "development-tools",
        title: "MCX ONE Platform",
        layer: "Layer #1",
        enabled: true,
        description: "Unified communication platform enabling mission-critical services",
        icon: "/platform-red.svg"
    },
    {
        id: "ai-platform",
        title: "Devices",
        layer: "Layer #2",
        enabled: true,
        description: "Smart devices and IoT endpoints integration",
        icon: "/devices-red.svg"
    },
    {
        id: "paas",
        title: "Apps & SDKs",
        layer: "Layer #3",
        enabled: true,
        description: "Development tools and APIs for rapid application development",
        icon: "/sdk-red.svg"
    },
    {
        id: "iaas",
        title: "Extensions",
        layer: "Layer #4",
        enabled: true,
        description: "Custom extensions and third-party integrations",
        icon: "/extensions-red.svg"
    }
];

export default function TechStackCube({
    className = "",
    autoRotate = false,
    rotationInterval = 3000
}: TechStackCubeProps) {
    const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!autoRotate || isHovered) return;

        const interval = setInterval(() => {
            setCurrentLayerIndex((prev) => {
                const enabledIndices = defaultLayers.map((layer, index) => layer.enabled ? index : -1).filter(i => i !== -1);
                const currentEnabledIndex = enabledIndices.indexOf(prev);
                const nextEnabledIndex = (currentEnabledIndex + 1) % enabledIndices.length;
                return enabledIndices[nextEnabledIndex];
            });
        }, rotationInterval);

        return () => clearInterval(interval);
    }, [autoRotate, rotationInterval, isHovered]);

    const handleLayerClick = (index: number) => {
        if (defaultLayers[index].enabled) {
            setCurrentLayerIndex(index);
        }
    };

    // Calculate Z-position based on C3.ai pattern: -16px base, then -64px, -112px, -160px, -208px
    const getZPosition = (index: number) => {
        return -16 - (index * 48); // -16, -64, -112, -160, -208
    };

    // PHYSICS-BASED LIGHTING MODEL
    // Single light source from top-left-front (-1, -1, -1 direction)
    // Consistent lighting that doesn't change with movement
    
    const getStaticCastShadow = (index: number, isCurrent: boolean) => {
        if (!isCurrent) {
            // Stacked layers - simple base shadow
            return '0 2px 4px rgba(0, 0, 0, 0.08)';
        }
        
        // Pulled out layer - casts shadow on the stack behind it
        // Shadow direction matches isometric light source (top-left)
        return '8px 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
    };

    // STATIC FACE LIGHTING - Based on face angle to light source
    // Light source: top-left-front (-1, -1, -1)
    // Face normals in isometric view:
    // - Left face normal: (-0.707, 0, 0.707) -> dot product with light = 0.5 -> medium brightness
    // - Right face normal: (0, -0.707, 0.707) -> dot product with light = 0.5 -> darker (away from light)
    
    const getStaticFaceStyle = (face: 'left' | 'right', isEnabled: boolean, isCurrent: boolean) => {
        if (!isEnabled) return {}; // Let disabled CSS handle this
        
        const opacity = isCurrent ? 1 : 0.6; // Only current vs non-current affects visibility
        
        if (face === 'left') {
            // Left face: 45° angle to light source - receives medium light
            return {
                backgroundColor: '#f5f5f5', // Light gray - faces towards light
                color: `rgba(0, 0, 0, ${opacity})`,
                // Subtle shadow from object self-occlusion
                boxShadow: 'inset -1px 0 2px rgba(0, 0, 0, 0.1)'
            };
        } else {
            // Right face: 135° angle to light source - faces away from light  
            return {
                backgroundColor: '#b8b8b8', // Darker gray - faces away from light
                color: `rgba(0, 0, 0, ${opacity})`,
                // Deeper shadow as it's away from light
                boxShadow: 'inset 1px 0 3px rgba(0, 0, 0, 0.2)'
            };
        }
    };

    const currentLayer = defaultLayers[currentLayerIndex];

    return (
        <>
            <style jsx>{`
        .c3ai-tech-stack {
          position: relative;
          padding: 4rem;
          background-color: #ffffff;
          color: #1e293b;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cube-container {
          position: relative;
          height: 560px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
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
          transition: 0.25s;
          shape-rendering: auto;         /* Enables anti-aliasing */
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
          shape-rendering: auto;         /* Enables anti-aliasing */
        }

        .cube-section.disabled {
          cursor: default;
          shape-rendering: auto;         /* Enables anti-aliasing */
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
          shape-rendering: auto;         /* Enables anti-aliasing */
        }

        .cube-section-left {
          position: absolute;
          height: 20%;
          width: 100%;
          margin-top: 80%;
          font-family: "Manrope", Helvetica, Arial, sans-serif;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing:0.025em;
          transform: rotateX(-90deg) translateY(100%);
          transform-origin: 100% 100%;
          display: grid;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
          user-select: none;
          padding: 0 0.5rem;
          -webkit-font-smoothing: antialiased;    /* For Chrome, Safari */
          -moz-osx-font-smoothing: grayscale;     /* For Firefox on macOS */
          text-rendering: optimizeLegibility;     /* Hints browser to optimize for legibility */
          shape-rendering: auto;         /* Enables anti-aliasing */
        }

        .cube-section-right {
          position: absolute;
          height: 20%;
          width: 100%;
          margin-top: 100%;
          font-family: "Manrope", Helvetica, Arial, sans-serif;
          font-size: 0.9rem;
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
          -webkit-font-smoothing: antialiased;    /* For Chrome, Safari */
          -moz-osx-font-smoothing: grayscale;     /* For Firefox on macOS */
          text-rendering: optimizeLegibility;     /* Hints browser to optimize for legibility */
          shape-rendering: auto;         /* Enables anti-aliasing */
        }

        /* Disabled state styling */
        .cube-section.disabled .cube-section-left {
          background-color: #6A6B6E !important;
          color: rgba(209, 211, 212, 0.5) !important;
          box-shadow: inset -1px 0 3px rgba(0, 0, 0, 0.4) !important;
          shape-rendering: auto;         /* Enables anti-aliasing */

        }

        .cube-section.disabled .cube-section-right {
          background-color: #525355 !important;
          color: rgba(197, 197, 197, 0.35) !important;
          box-shadow: inset 1px 0 5px rgba(0, 0, 0, 0.35) !important;
          shape-rendering: auto;         /* Enables anti-aliasing */

        }

        .cube-section.disabled .cube-section-top {
          opacity: 0.2 !important;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3) !important;
          shape-rendering: auto;         /* Enables anti-aliasing */

        }

        /* Info panel */
        .layer-info {
          text-align: center;
          width: 100%;
          max-width: 600px;
          font-family: "Manrope", Helvetica, Arial, sans-serif;
          padding: 2rem;
          margin-top: 2rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .info-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .info-subtitle {
          font-size: 1rem;
          color: #dc2626;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .info-description {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Navigation */
        .layer-navigation {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }

        .nav-button {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .nav-button:hover:not(.disabled) {
          border-color: #dc2626;
          color: #dc2626;
          background: #fef2f2;
        }

        .nav-button.active {
          background: #dc2626;
          border-color: #dc2626;
          color: #ffffff;
        }

        .nav-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f1f5f9;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .perspective {
            transform: rotateX(55deg) rotateZ(45deg) scale3d(0.7, 0.7, 0.7);
          }
          
          .cube-container {
            height: 400px;
          }
          
          .nav-button {
            font-size: 11px;
            padding: 6px 12px;
          }
          
          .cube-section-left {
            font-size: 0.85rem;
          }
          
          .cube-section-right {
            font-size: 0.75rem;
          }
        }
      `}</style>

            <div className={`c3ai-tech-stack ${className}`}>
                <div
                    className="cube-container"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="perspective">
                        <div className="cube">
                            {defaultLayers.map((layer, index) => {
                                const isCurrent = index === currentLayerIndex;
                                const leftFaceStyle = getStaticFaceStyle('left', layer.enabled, isCurrent);
                                const rightFaceStyle = getStaticFaceStyle('right', layer.enabled, isCurrent);

                                return (
                                    <div
                                        key={layer.id}
                                        className={`cube-section ${isCurrent ? 'current' : ''} ${!layer.enabled ? 'disabled' : ''}`}
                                        onClick={() => handleLayerClick(index)}
                                        style={{
                                            transform: isCurrent
                                                ? `translate3d(100%, 0px, ${getZPosition(index)}px) scale(0.8, 0.8)`
                                                : `translate3d(0px, 0px, ${getZPosition(index)}px) scale(0.8, 0.8)`,
                                            boxShadow: getStaticCastShadow(index, isCurrent)
                                        }}
                                    >
                                        <div
                                            className="cube-section-top"
                                            style={{
                                                backgroundImage: layer.icon ? `url(${layer.icon})` : 'none',
                                                opacity: !layer.enabled ? 0.2 : (isCurrent ? 1 : 0.3)
                                            }}
                                        />
                                        <div
                                            className="cube-section-left"
                                            style={layer.enabled ? leftFaceStyle : {}}
                                        >
                                            {layer.title}
                                        </div>
                                        <div
                                            className="cube-section-right"
                                            style={layer.enabled ? rightFaceStyle : {}}
                                        >
                                            {layer.layer}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Layer Info Panel */}
                <div className="layer-info">
                    <h3 className="info-title">{currentLayer.title}</h3>
                    <p className="info-subtitle">{currentLayer.layer}</p>
                    {currentLayer.description && (
                        <p className="info-description">{currentLayer.description}</p>
                    )}
                </div>

                {/* Layer Navigation */}
                <div className="layer-navigation">
                    {defaultLayers.map((layer, index) => (
                        <button
                            key={index}
                            className={`nav-button ${index === currentLayerIndex ? 'active' : ''} ${!layer.enabled ? 'disabled' : ''}`}
                            onClick={() => handleLayerClick(index)}
                            disabled={!layer.enabled}
                        >
                            {layer.title}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
} 