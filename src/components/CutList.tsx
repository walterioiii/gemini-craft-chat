import { Cabinet, ProjectSettings } from '@/lib/types';
import { generateParts, formatInch } from '@/lib/nesting';

interface CutListProps {
  cabinets: Cabinet[];
  settings: ProjectSettings;
}

interface CutListItem {
  partName: string;
  width: number;
  height: number;
  qty: number;
  unitNames: string[];
}

export function CutList({ cabinets, settings }: CutListProps) {
  // Generate all parts from all cabinets
  const allParts = cabinets.flatMap(cabinet => generateParts(cabinet, settings));

  // Group parts by name and dimensions
  const groupedParts = allParts.reduce((acc, part) => {
    const key = `${part.partName}-${part.width}-${part.height}`;
    if (!acc[key]) {
      acc[key] = {
        partName: part.partName,
        width: part.width,
        height: part.height,
        qty: 0,
        unitNames: []
      };
    }
    acc[key].qty++;
    if (!acc[key].unitNames.includes(part.unitName)) {
      acc[key].unitNames.push(part.unitName);
    }
    return acc;
  }, {} as Record<string, CutListItem>);

  const cutList = Object.values(groupedParts).sort((a, b) => {
    // Sort by part name, then by size
    if (a.partName !== b.partName) return a.partName.localeCompare(b.partName);
    return (b.width * b.height) - (a.width * a.height);
  });

  const totalParts = cutList.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="cutlist-container">
      <h3 className="text-lg font-bold mb-4">Cut List — {totalParts} Total Parts</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Part</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Dimensions</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Qty</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Used In</th>
            </tr>
          </thead>
          <tbody>
            {cutList.map((item, index) => (
              <tr key={index} className="even:bg-gray-25">
                <td className="border border-gray-300 px-3 py-2 font-medium">
                  {item.partName}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-mono">
                  {formatInch(item.width)} × {formatInch(item.height)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                  {item.qty}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {item.unitNames.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>Material: {settings.materialThickness}" plywood</p>
        <p>Generated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}