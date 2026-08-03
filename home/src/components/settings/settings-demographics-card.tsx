import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemographicDefinitionRow } from "@/components/settings/demographic-definition-row";
import {
  DEMOGRAPHIC_FIELDS,
  type DemographicsDisplay,
} from "@/components/settings/settings-demographics";

export function SettingsDemographicsCard({
  demographics,
}: {
  demographics: DemographicsDisplay;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Demographics</CardTitle>
        <CardDescription>
          Demographic information collected during the study. To update these,
          complete the demographics form in the survey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {DEMOGRAPHIC_FIELDS.map(({ key, label, format }) => {
            const raw = demographics[key];
            return (
              <DemographicDefinitionRow
                key={key}
                label={label}
                value={raw ? format(raw) : null}
              />
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}
