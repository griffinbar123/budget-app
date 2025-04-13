// app/page.js
'use client'
import Link from 'next/link';
import PrimaryButton from './components/buttons/primary-button'; // Import PrimaryButton
import { FiLogIn, FiUserPlus } from 'react-icons/fi'; // Import icons
import PageHeader from './components/generic/page-header';


export default function HomePage() {
    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-primary">
      <PageHeader title={"Welcome to Budget App!"} subtitle={"Sign in to continue."} />
      <div className="space-y-4 mt-6">
        <Link href="/login">
            <PrimaryButton className="flex items-center gap-2">
                <FiLogIn className="w-5 h-5" />
                Sign In
            </PrimaryButton>
        </Link>
         <Link href="/signup">
            <PrimaryButton className="flex items-center gap-2">
                <FiUserPlus className="w-5 h-5"/>
                Sign Up
            </PrimaryButton>
        </Link>
      </div>
    </div>
    );
}