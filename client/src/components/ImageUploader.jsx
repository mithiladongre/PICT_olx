import React, { useState } from 'react';

// onImagesChange will be called with: { files: File[], previews: string[] }
const ImageUploader = ({ images = [], onImagesChange, maxImages = 5 }) => {
  const [previewImages, setPreviewImages] = useState(Array.isArray(images) ? images : []);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const emitChange = (files, previews) => {
    if (onImagesChange) onImagesChange({ files, previews });
  };

  const handleFileChange = (e) => {
    const incomingFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    console.log('Selected files:', incomingFiles);
    
    if (incomingFiles.length + previewImages.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newFiles = [...selectedFiles, ...incomingFiles];
    const newPreviews = [...previewImages];

    let remaining = incomingFiles.length;
    incomingFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target.result);
        remaining -= 1;
        if (remaining === 0) {
          console.log('Final files:', newFiles);
          console.log('Final previews:', newPreviews);
          setSelectedFiles(newFiles);
          setPreviewImages(newPreviews);
          emitChange(newFiles, newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    setSelectedFiles(newFiles);
    emitChange(newFiles, newPreviews);
  };

  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Images (Max {maxImages})</label>
        <input
          type="file"
          className="form-control"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={previewImages.length >= maxImages}
        />
        <div className="form-text">
          {previewImages.length}/{maxImages} images selected
        </div>
      </div>

      {previewImages.length > 0 && (
        <div className="row g-2">
          {previewImages.map((image, index) => (
            <div key={index} className="col-md-3 col-sm-4 col-6">
              <div className="position-relative">
                <img
                  src={image}
                  className="img-fluid rounded"
                  alt={`Preview ${index + 1}`}
                  style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                  onClick={() => removeImage(index)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
