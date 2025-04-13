import React from 'react'
import NotBuiltYet from '@/app/components/not-built-yet'; // Import the component
import PageHeader from "@/app/components/generic/page-header";

function page() {
  return (
    <>
          <PageHeader title="AI Chat" subtitle="This feature is currently under construction."/>
          <NotBuiltYet />
      </>
  )
}

export default page