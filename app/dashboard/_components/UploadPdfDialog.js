"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { Loader2Icon } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import uuid4 from 'uuid4'
import { useUser } from '@clerk/nextjs'
  

function UploadPdfDialog({children}) {
  const generateUploadUrl=useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntry=useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileUrl=useMutation(api.fileStorage.getFileUrl);
  const {user}=useUser()
  const [file,setFile]=useState();
  const [fileName,setFileName]=useState();
  const [load,setLoading]=useState(false);
  const OnFileSelect = (event)=>{
    setFile(event.target.files[0]);
  }

  const OnUpload =async() =>{
    setLoading(true);
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();

    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file?.type },
      body: file,
    });
    const { storageId } = await result.json();
    const fileId=uuid4();
    const fileUrl=await getFileUrl({storageId:storageId});

    const resp=await addFileEntry({
      fileId:fileId,
      storageId:storageId,
      fileName:fileName??'Untitled File',
      fileUrl:fileUrl,
      createdBy:user?.primaryEmailAddress?.emailAddress
    })
    console.log('Response',resp);
    setLoading(false);
  }

  return (
    <Dialog>
    <DialogTrigger asChild>
        {children}
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Upload Pdf File</DialogTitle>
        <DialogDescription asChild>
            <div>
                <h2 className='mt-5 '>Select a file to Upload</h2>
                <div className='gap-2 p-3 rounded-md border'>
                    <input type='file' accept='application/pdf' onChange={(event)=>OnFileSelect(event)}/>
                </div>
                <div className='mt-2'>
                    <label>File Name*</label>
                    <Input placeholder="File Name" onChange={(e)=>setFileName(e.target.value)}/>
                </div>
            </div>
        </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={OnUpload}>
            {load?
            <Loader2Icon className='animate-spin'/>:'Upload'}
            </Button>
        </DialogFooter>
    </DialogContent>
    </Dialog>

  )
}

export default UploadPdfDialog