/* =====================================================
   FAMILIAS DE EJEMPLO — MODO DEMO (sin backend)
   -----------------------------------------------------
   Esto simula lo que normalmente vendría de MySQL a
   través de api/validar_familia.php
   El cliente real reemplazará esto por la base de datos
   (ver /database/schema.sql y /backend-php).

   Códigos de prueba que puedes usar en la página:
     RIOS2026   -> Familia Ríos, 4 lugares
     TORRES5    -> Familia Torres, 5 lugares
     LUNA1      -> Invitado individual, 1 lugar
     GOMEZ3     -> Familia Gómez, 3 lugares
===================================================== */

const FAMILIAS_DEMO = {
  "RIOS2026": {
    id: "RIOS2026",
    nombre_familia: "Familia Ríos",
    invitados: ["Sr. Alberto Ríos", "Sra. Patricia Ríos", "Daniela Ríos", "Emilio Ríos"]
  },
  "TORRES5": {
    id: "TORRES5",
    nombre_familia: "Familia Torres",
    invitados: ["Jorge Torres", "Mariana Torres", "Sofía Torres", "Diego Torres", "Renata Torres"]
  },
  "LUNA1": {
    id: "LUNA1",
    nombre_familia: "Invitado especial",
    invitados: ["Fernanda Luna"]
  },
  "GOMEZ3": {
    id: "GOMEZ3",
    nombre_familia: "Familia Gómez",
    invitados: ["Ricardo Gómez", "Valeria Gómez", "Santiago Gómez"]
  }
};
