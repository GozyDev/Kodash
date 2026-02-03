import { ChartArea } from "lucide-react";

export default function AnalyticClient() {
  return (
    <div className="flex gap-3 justify-center items-center flex-col h-[80vh] border-2 border-dashed border-cardCB rounded-lg m-4">
      <div className="bg-cardC p-4 rounded-full">
       <ChartArea size={40} />
      </div>
      <div className="text-center">
        <h3 className="text-textNa font-medium text-md">Opps!!</h3>
        <p className="text-textNd text-sm mt-1 capitalize">
          Your Request overview still in development.
        </p>
      </div>
    </div>
  );
}
