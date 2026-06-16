/**
 * Fond décoratif « aurora » : halos colorés flous qui dérivent lentement.
 * Purement décoratif (aria-hidden), sans interaction, animé en CSS.
 * À placer comme premier enfant d'un conteneur `relative overflow-hidden`.
 */
export default function Aurora() {
    return (
        <div className="aurora pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <span className="aurora-blob aurora-blob-1" />
            <span className="aurora-blob aurora-blob-2" />
            <span className="aurora-blob aurora-blob-3" />
        </div>
    );
}
