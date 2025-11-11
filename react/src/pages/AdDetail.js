import React from 'react';
import { useParams } from 'react-router-dom';

export default function AdDetail() {
  const { id } = useParams();
  return (
    <div data-easytag="id3-react/src/pages/AdDetail.js">
      <h1>Объявление</h1>
      <p>ID объявления: {id}</p>
    </div>
  );
}
