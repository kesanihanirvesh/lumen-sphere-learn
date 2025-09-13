import { Button } from '@/components/ui/button'
import React from 'react'

export default function Myquizpage() {
  const sebFileUrl = './SebClientSettings.seb';
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = sebFileUrl;
    link.download = "exam_config.seb"; // file name on download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{height:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:"20px"}}>
        <h1>Here are my quizzes to attempt</h1>
        <Button onClick={handleDownload}>
          Launch SafeBrowser and start quiz
        </Button>
      </div>
    </div>
  )
}
