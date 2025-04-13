// app/components/generic/NavigationLinks.jsx
import Link from 'next/link';

function NavigationLinks({ links }) {
  return (
    <footer className="mt-8 flex justify-center space-x-4 px-4 sm:px-6 md:px-8 lg:px-10">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-accent-primary hover:text-accent-primary/80">
          {link.text}
        </Link>
      ))}
    </footer>
  );
}

export default NavigationLinks;