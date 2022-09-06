import React from 'react';
import { Routes, Route } from 'react-router-dom';

import {
  AddMushroom,
  EditMushroom,
  Mushrooms,
  Pictures,
  ShowMushroom,
  UploadPicture,
} from './views';

export const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Pictures />} />
      <Route path="/mushrooms" element={<Mushrooms />} />
      <Route path="/mushrooms/:documentId" element={<ShowMushroom />} />
      <Route path="/mushrooms/:documentId/edit" element={<EditMushroom />} />
      <Route path="/mushrooms/new" element={<AddMushroom />} />
      <Route path="/upload" element={<UploadPicture />} />
    </Routes>
  );
};
