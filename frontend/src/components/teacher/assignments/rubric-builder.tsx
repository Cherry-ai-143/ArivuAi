import { Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RubricCriterion } from '@/types/assignment';

interface RubricBuilderProps {
  criteria: RubricCriterion[];
  onChange: (criteria: RubricCriterion[]) => void;
  maxPoints: number;
}

export function RubricBuilder({ criteria, onChange, maxPoints }: RubricBuilderProps) {
  const totalPoints = criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);
  const isValid = totalPoints === maxPoints;

  const handleAddCriterion = () => {
    const newCriterion: RubricCriterion = {
      criterion_name: '',
      max_points: 10,
      description: '',
      order_index: criteria.length,
    };
    onChange([...criteria, newCriterion]);
  };

  const handleRemoveCriterion = (index: number) => {
    const updated = criteria.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateCriterion = (index: number, field: keyof RubricCriterion, value: any) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 bg-gray-50/50 p-5 rounded-xl border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h4 className="text-base font-semibold text-gray-900">Grading Rubric</h4>
          <p className="text-xs text-gray-500">
            Define criteria and allocate points for detailed evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isValid
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {isValid ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>
              Total: {totalPoints} / {maxPoints} pts
            </span>
          </div>

          <Button
            type="button"
            onClick={handleAddCriterion}
            variant="outline"
            size="sm"
            className="gap-1 text-xs border-gray-300"
          >
            <Plus className="w-3.5 h-3.5" /> Add Criterion
          </Button>
        </div>
      </div>

      {!isValid && criteria.length > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          The sum of rubric criterion points ({totalPoints}) does not equal the assignment max points ({maxPoints}). Please adjust point values.
        </div>
      )}

      {criteria.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
          No rubric criteria added yet. Click &quot;Add Criterion&quot; to build your rubric.
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3 relative group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div className="sm:col-span-3">
                  <Input
                    placeholder="Criterion Name (e.g. Technical Quality)"
                    value={item.criterion_name}
                    onChange={(e) => handleUpdateCriterion(index, 'criterion_name', e.target.value)}
                    className="h-9 text-sm font-medium"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.max_points}
                    onChange={(e) =>
                      handleUpdateCriterion(index, 'max_points', Number(e.target.value))
                    }
                    className="h-9 text-sm w-24"
                  />
                  <span className="text-xs text-gray-500">pts</span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCriterion(index)}
                    className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Description of criteria expectations (optional)"
                value={item.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateCriterion(index, 'description', e.target.value)}
                rows={2}
                className="text-xs bg-gray-50/50"
              />

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
