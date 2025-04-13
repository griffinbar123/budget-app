// app/auth/error/page.jsx

export default function AuthErrorPage() {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-primary">
        <div className="bg-background-secondary p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-danger-primary">Authentication Error</h1>
          <p className="text-text-secondary">
            There was a problem confirming your email address. Please check the link and try again, or contact support.
          </p>
          {/* Optionally, add a link back to the home page or a "retry" button */}
        </div>
      </div>
    );
  }