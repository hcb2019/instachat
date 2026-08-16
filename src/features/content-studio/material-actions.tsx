"use client";
import { useState } from "react";
import { Check, Download, Link as LinkIcon, Printer } from "lucide-react";
export function MaterialActions(){const[copied,setCopied]=useState(false);return <div className="material-actions"><button onClick={async()=>{await navigator.clipboard.writeText(window.location.href);setCopied(true);window.setTimeout(()=>setCopied(false),1200)}}>{copied?<Check size={15}/>:<LinkIcon size={15}/>} {copied?"Link copiado":"Copiar link"}</button><button onClick={()=>window.print()}><Download size={15}/>Salvar em PDF</button><button onClick={()=>window.print()}><Printer size={15}/>Imprimir</button></div>}
