import React from 'react';

const CvModelShow = ({ cvModel }) => {
    return (
        <div className="container">
            <h2>{cvModel.name}</h2>
            <p>{cvModel.description}</p>
            <p>Price: {cvModel.price}</p>
            <img src={`/storage/${cvModel.previewImagePath}`} alt={cvModel.name} width="200" />
            <a href={route('CvModels.index')} className="btn btn-primary mt-3">Back</a>
        </div>
    );
};

export default CvModelShow;
