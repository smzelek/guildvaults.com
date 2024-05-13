import * as React from "react";
import { App } from "./components/App";
import './global.scss';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(<App />);
