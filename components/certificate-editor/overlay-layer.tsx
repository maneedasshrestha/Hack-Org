'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { TextFieldConfig } from '@/types';

interface OverlayLayerProps {
    config: TextFieldConfig;
    onUpdate: (updates: Partial<TextFieldConfig>) => void;
    containerWidth: number;
    containerHeight: number; // Important to constrain bounds
}

export function OverlayLayer({ config, onUpdate, containerWidth, containerHeight }: OverlayLayerProps) {

    // Style object for the text
    const textStyle: React.CSSProperties = {
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        color: config.color,
        textAlign: config.alignment,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center', // Vertically center for better look? Or top? Usually top.
        justifyContent: config.alignment === 'left' ? 'flex-start' : config.alignment === 'right' ? 'flex-end' : 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    };

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <Rnd
                size={{ width: config.width, height: config.height }}
                position={{ x: config.x, y: config.y }}
                onDragStop={(e, d) => {
                    onUpdate({ x: d.x, y: d.y });
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    onUpdate({
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        ...position,
                    });
                }}
                bounds="parent"
                className="pointer-events-auto border-2 border-primary border-dashed bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
                <div style={textStyle} className="px-1 select-none cursor-move">
                    {config.text}
                </div>
            </Rnd>
        </div>
    );
}
