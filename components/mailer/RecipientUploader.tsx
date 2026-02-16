'use client';

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';

interface Recipient {
    email: string;
    name?: string;
    [key: string]: any;
}

interface RecipientUploaderProps {
    onRecipientsParsed: (recipients: Recipient[]) => void;
}

const RecipientUploader: React.FC<RecipientUploaderProps> = ({ onRecipientsParsed }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            return;
        }

        setFileName(file.name);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.error(results.errors);
                    setError('Error parsing CSV. Please check the format.');
                    return;
                }

                // Basic validation: Check for 'email' column
                const firstRow = results.data[0] as any;
                if (!firstRow || !firstRow.hasOwnProperty('email')) {
                    setError('CSV must contain an "email" column.');
                    return;
                }

                onRecipientsParsed(results.data as Recipient[]);
            },
            error: (err) => {
                setError('Failed to parse file: ' + err.message);
            }
        });
    }, [onRecipientsParsed]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1
    });

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFileName(null);
        onRecipientsParsed([]);
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-8">
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...getRootProps()}
                className={`
            relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer 
            transition-colors duration-300 ease-in-out shadow-sm
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'}
            ${fileName ? 'border-emerald-500 bg-emerald-50' : ''}
        `}
            >
                <input {...getInputProps()} />

                {fileName ? (
                    <div className="flex items-center space-x-3 text-emerald-600">
                        <FileText size={32} />
                        <span className="text-lg font-medium truncate max-w-xs">{fileName}</span>
                        <button onClick={clearFile} className="p-1 hover:bg-emerald-100 rounded-full transition-colors">
                            <X size={20} className="text-emerald-400 hover:text-emerald-700" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-500">
                        <Upload size={40} className="mb-3 text-indigo-500" />
                        <p className="text-sm font-medium text-slate-700">
                            {isDragActive ? "Drop the CSV here..." : "Drag & drop CSV or click to browse"}
                        </p>
                        <p className="text-xs mt-2 text-slate-400">Columns: email, name (optional)</p>
                    </div>
                )}
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-rose-500 text-sm text-center font-medium"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default RecipientUploader;
