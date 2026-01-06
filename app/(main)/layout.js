// app/(main)/layout.jsx
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Header from "@/_Pages/main/header/header";
import Footer from "@/_Pages/main/footer/footer";
import Scroll from "@/_Pages/main/Extras/Scroll/scroll";
export default function MainLayout({ children }) {
  return (
    <>
      <div>
        <ClienteWrapper>
          <Header></Header>
        </ClienteWrapper>
      </div>
      {children}
      <div>
        <ClienteWrapper>
          <Footer></Footer>
        </ClienteWrapper>
      </div>
      <ClienteWrapper>
        <Scroll />
      </ClienteWrapper>
    </>
  );
}