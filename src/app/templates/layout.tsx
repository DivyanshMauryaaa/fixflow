export default function TemplatesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="container mx-auto">
            {children}
        </div>
    )
}