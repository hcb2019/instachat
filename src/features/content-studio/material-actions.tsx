"use client";
import { Download, Printer } from "lucide-react";
export function MaterialActions(){return <div className="material-actions"><button onClick={()=>window.print()}><Download size={15}/>Salvar em PDF</button><button onClick={()=>window.print()}><Printer size={15}/>Imprimir</button></div>}
