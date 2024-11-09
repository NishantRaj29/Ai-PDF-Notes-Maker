import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const pdfUrl="https://fastidious-swan-6.convex.cloud/api/storage/1785ea96-fc4d-4b34-ad63-5e1941d8b0bc";
export async function GET(req){

    const response=await fetch(pdfUrl);
    const data=await response.blob();
    const loader=new WebPDFLoader(data);
    const docs=await loader.load();

    let pdfTextContent='';
    docs.forEach(doc=>{
        pdfTextContent=pdfTextContent+doc.pageContent;
    });

    //split the text into small chunk
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
    });

    const output = await splitter.createDocuments([pdfTextContent]);

    let splitterList=[];
    output.forEach(doc=>{
        splitterList.push(doc.pageContent);
    })


    return NextResponse.json({result:splitterList})
}