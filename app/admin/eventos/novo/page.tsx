import FormEvento from "../FormEvento";

export default function NovoEvento() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Evento</h1>
      <p className="text-gray-500 text-sm mb-8">Preencha as informações do evento.</p>
      <FormEvento />
    </div>
  );
}
