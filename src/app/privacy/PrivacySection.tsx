interface PrivacySectionProps {
  title: string;
  icon: string;
  content: string;
}

export default function PrivacySection({ title, icon, content }: PrivacySectionProps) {
  return (
    <div className="privacy-card">
      <div className="privacy-card__header">
        <i className={`fa-solid ${icon} privacy-card__icon`} aria-hidden="true"></i>
        <h2 className="privacy-card__title">{title}</h2>
      </div>
      <p className="privacy-card__content">{content}</p>
    </div>
  );
}
