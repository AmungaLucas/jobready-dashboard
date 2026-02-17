'use client'

import { useState, useRef, useEffect } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export default function UserTooltip({ uid, createdAt, lastLogin }) {
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipStyle, setTooltipStyle] = useState({})
    const buttonRef = useRef(null)
    const tooltipRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowTooltip(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Calculate position when tooltip opens
    useEffect(() => {
        if (showTooltip && buttonRef.current && tooltipRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const tooltipRect = tooltipRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            // Default position (bottom)
            let top = buttonRect.bottom + 8
            let left = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2)

            // Check if bottom would go off screen
            if (buttonRect.bottom + tooltipRect.height + 8 > viewportHeight) {
                // Position above
                top = buttonRect.top - tooltipRect.height - 8
            }

            // Check left edge
            if (left < 8) {
                left = 8
            }

            // Check right edge
            if (left + tooltipRect.width > viewportWidth - 8) {
                left = viewportWidth - tooltipRect.width - 8
            }

            // Ensure tooltip doesn't go above viewport
            if (top < 8) {
                top = 8
            }

            setTooltipStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 9999,
            })
        }
    }, [showTooltip])

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        } catch {
            return dateString
        }
    }

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none p-2 touch-manipulation"
                aria-label="User information"
            >
                <InformationCircleIcon className="h-5 w-5 sm:h-5 sm:w-5" />
            </button>

            {showTooltip && (
                <div
                    ref={tooltipRef}
                    className="w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg"
                    style={tooltipStyle}
                >
                    <div className="space-y-2">
                        <div>
                            <div className="text-gray-400 font-medium mb-1">UID</div>
                            <div className="font-mono break-all bg-gray-800 p-2 rounded">{uid || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 font-medium mb-1">Created</div>
                            <div className="bg-gray-800 p-2 rounded">{formatDate(createdAt)}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 font-medium mb-1">Last Login</div>
                            <div className="bg-gray-800 p-2 rounded">{formatDate(lastLogin)}</div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div
                        className="absolute w-0 h-0"
                        style={{
                            top: tooltipStyle.top ?
                                (parseInt(tooltipStyle.top) < buttonRef.current?.getBoundingClientRect().top ? 'auto' : '-6px') : 'auto',
                            bottom: tooltipStyle.top && parseInt(tooltipStyle.top) > buttonRef.current?.getBoundingClientRect().top ?
                                'auto' : '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: tooltipStyle.top && parseInt(tooltipStyle.top) > buttonRef.current?.getBoundingClientRect().top ?
                                '6px solid #111827' : 'none',
                            borderBottom: tooltipStyle.top && parseInt(tooltipStyle.top) < buttonRef.current?.getBoundingClientRect().top ?
                                '6px solid #111827' : 'none',
                        }}
                    />
                </div>
            )}
        </div>
    )
}