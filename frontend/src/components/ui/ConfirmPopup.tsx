"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ConfirmPopupProps {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
    title = "Confirm",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 10);
    }, []);

    const close = () => {
        setVisible(false);
        setTimeout(() => onCancel(), 180);
    };

    const confirm = () => {
        setVisible(false);
        setTimeout(() => onConfirm(), 180);
    };

    return (
        <div
            className={`
        fixed inset-0 flex items-center justify-center bg-black/40 z-50 
        transition-opacity duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
        >
            <div
                className={`
                    bg-white rounded-xl p-6 w-full max-w-sm shadow-lg relative
                    transition-all duration-200
                    ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-3"}
        `}
            >
                <button
                    onClick={close}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    <X size={18} />
                </button>

                <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>

                <p className="text-sm text-gray-600 mb-5">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={close}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={confirm}
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;
