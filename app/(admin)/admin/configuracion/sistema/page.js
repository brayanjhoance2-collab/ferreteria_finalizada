// app/page.js
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import ConfiguracionSistema from "@/_Pages/admin/configuracion/sistema/sistema";
export default function page() {
  return (
    <div>
      <ClienteWrapper>
        <ConfiguracionSistema></ConfiguracionSistema>
      </ClienteWrapper>
    </div>
  );
}
