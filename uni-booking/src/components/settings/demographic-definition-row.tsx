import { Badge } from "@/components/ui/badge";

export function DemographicDefinitionRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className='space-y-1'>
      <dt className='text-sm font-medium text-muted-foreground'>{label}</dt>
      <dd>
        {value ? (
          <Badge variant='secondary'>{value}</Badge>
        ) : (
          <span className='text-sm text-muted-foreground italic'>
            Not provided
          </span>
        )}
      </dd>
    </div>
  );
}
