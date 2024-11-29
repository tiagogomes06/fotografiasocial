import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Lock, ShoppingBag } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-4 border-b border-border/40 backdrop-blur-sm fixed w-full top-0 z-50 bg-background/80">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-semibold">PhotoAccess</h1>
          <nav className="space-x-6">
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link 
              to="/access"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Aceder às Fotos
            </Link>
          </nav>
        </div>
      </header>

      <main className="container pt-32 pb-16">
        <section className="text-center space-y-6 animate-fade-up">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl font-bold tracking-tight">As Suas Memórias Escolares</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Aceda e encomende as suas fotografias escolares profissionais com facilidade. Seguro, simples e lindamente apresentado.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 mt-8">
            <Link
              to="/access"
              className="group bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Começar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/store"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md hover:bg-secondary/80 transition-colors"
            >
              Visitar Loja
            </Link>
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Lock,
              title: "Acesso Seguro",
              description: "Aceda às suas fotos com um código único ou digitalização QR",
            },
            {
              icon: Camera,
              title: "Qualidade Profissional",
              description: "Fotografias de alta resolução capturadas por fotógrafos especializados",
            },
            {
              icon: ShoppingBag,
              title: "Encomenda Fácil",
              description: "Encomende impressões e cópias digitais com opções de pagamento simples",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/50"
            >
              <feature.icon className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Index;