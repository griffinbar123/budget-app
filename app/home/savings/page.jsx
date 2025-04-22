// app/home/savings/page.jsx
'use client'
import PageHeader from "@/app/components/generic/page-header";
import NotBuiltYet from '@/app/components/not-built-yet';

export default function SavingsPageMVP() { // Rename if you like
    return (
        <>
            <PageHeader title="Savings" subtitle="Track your savings goals (Coming Soon!)"/>
            <NotBuiltYet />
        </>
    )
}