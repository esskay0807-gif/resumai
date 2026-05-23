import { useDropzone } from 'react-dropzone';

export default function FileUpload({ file, onFileChange }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) onFileChange(accepted[0]);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-brand-500 bg-brand-50'
          : file
          ? 'border-green-400 bg-green-50'
          : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
      }`}
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium text-green-700 text-sm">{file.name}</p>
          <p className="text-xs text-slate-400">
            {(file.size / 1024).toFixed(0)} KB — click or drag to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-700">
              {isDragActive ? 'Drop it here' : 'Drop resume here or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF or DOCX · max 10 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
