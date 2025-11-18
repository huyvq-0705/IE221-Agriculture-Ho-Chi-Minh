"use client";
import React, { useEffect, useState } from "react";

interface AlertPopupProps {
    message: string;
    type?: "success" | "error";
    duration?: number;
    onClose?: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({
    message,
    type = "success",
    duration = 2000,
    onClose,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 10);

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 200);
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`
        fixed bottom-5 right-5 px-4 py-3 rounded-lg text-white shadow-lg 
        transition-all duration-200 z-50
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
        >
            {message}
        </div>
    );
};

export default AlertPopup;
