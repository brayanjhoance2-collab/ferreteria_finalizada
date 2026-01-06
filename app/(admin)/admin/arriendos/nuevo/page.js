// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import NuevoArriendo from "@/_Pages/admin/arriendos/nuevo/nuevo";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <NuevoArriendo></NuevoArriendo>
      </ClienteWrapper>
    </div>
  );
}
