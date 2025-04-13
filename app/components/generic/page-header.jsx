
function PageHeader({ title, subtitle }) {
    return (
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
                {title}
            </h1>
            <p className="text-text-secondary">{subtitle}</p>
        </header>
    );
}

export default PageHeader;