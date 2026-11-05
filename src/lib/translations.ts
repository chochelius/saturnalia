export interface Translation {
  nav: {
    home: string;
    bio: string;
    discography: string;
    contact: string;
  };
  heroSection: {
    title: string;
    subtitle: string;
  };
  bioSection: {
    title: string;
    p1: string;
    p2: string;
    p3: string;
  };
  albumSection: {
    title: string;
    buyNow: string;
  };
  contactSection: {
    title: string;
    description: string;
    form: {
      name: {
        label: string;
        placeholder: string;
      };
      email: {
        label: string;
        placeholder: string;
      };
      message: {
        label: string;
        placeholder: string;
      };
      submit: string;
    };
    toast: {
      title: string;
      description: string;
    };
  };
}

export const translations: { en: Translation; es: Translation } = {
  en: {
    nav: {
      home: "Home",
      bio: "Bio",
      discography: "Discography",
      contact: "Contact",
    },
    heroSection: {
      title: "DOUBLE FACED",
      subtitle: "Official music video from 'Can You Be Honest For Once?' — Out now.",
    },
    bioSection: {
      title: "Biography",
      p1: "SATURNALIA999 is a gothic solo experimental act based in Chile. Active in the underground scene since 2009 with Saturnalia as voice, composer, lyrics, performance and violin being the only official member through the years but collaborating with multiple musicians, producers and support members.",
      p2: "Her first songs from 2009 were never recorded yet archived. On 2012 Saturnalia's online friend ONIMORTIS (based in UK) gives some beats to her which later would become her early singles. Later from 2013 to 2015 Saturnalia released 2 demo EPs with original songs and covers, she also released a video for 'Necrosis' then went on hiatus deleting everything.",
      p3: "Few years later on 2017 Saturnalia continued her project and teamed up with a new member as guitar and bass but he left after few months due to musical differences. In 2018 Saturnalia uploads a snippet of her song 'A.M.' then in the following years she focused on performance until 2021 when she release her first single 'A.M.' then in December her second one 'NECROSIS'. In 2022 she releases 'TELL ME WHAT TO TELL YOU' and held her first live show. In 2023 she released 'MECHANIC ANGEL' and 'YOUNG BLOOD'. The video clip for 'A.M.' got released in midyear. Her debut album 'WHY TO LIVE FOR A DREAM?' came out in Halloween that year with 13 original songs then on February 29th, 2024 the deluxe edition got out with 12 new songs and digital art visualizers. Her second album 'CAN YOU BE HONEST FOR ONCE?' was released on Halloween 2024.",
    },
    albumSection: {
      title: "Discography",
      buyNow: "Buy Now",
    },
    contactSection: {
      title: "Make Contact",
      description: "Have a question, a proposal, or just want to connect? Drop a line into the datastream.",
      form: {
        name: {
          label: "Handle",
          placeholder: "Your alias",
        },
        email: {
          label: "Secure Channel (Email)",
          placeholder: "your.address@protocol.net",
        },
        message: {
          label: "Message",
          placeholder: "Your message...",
        },
        submit: "Send Message",
      },
      toast: {
        title: "Message Sent!",
        description: "Thanks for reaching out. We'll get back to you soon.",
      },
    },
  },
  es: {
    nav: {
      home: "Inicio",
      bio: "Bio",
      discography: "Discografía",
      contact: "Contacto",
    },
    heroSection: {
      title: "DOUBLE FACED",
      subtitle: "Video musical oficial de 'Can You Be Honest For Once?' — Disponible ahora.",
    },
    bioSection: {
      title: "Biografía",
      p1: "SATURNALIA999 es un acto experimental gótico en solitario con sede en Chile. Activa en la escena underground desde 2009 con Saturnalia como voz, compositora, letrista, intérprete y violinista, siendo la única miembro oficial a lo largo de los años, pero colaborando con múltiples músicos, productores y miembros de apoyo.",
      p2: "Sus primeras canciones de 2009 nunca fueron grabadas pero sí archivadas. En 2012, ONIMORTIS (residente en Reino Unido), amigo online de Saturnalia, le proporciona algunos ritmos que más tarde se convertirían en sus primeros sencillos. Posteriormente, de 2013 a 2015, Saturnalia lanzó 2 EPs de demostración con canciones originales y versiones, también lanzó un video para 'Necrosis' y luego entró en un hiato, eliminando todo.",
      p3: "Pocos años después, en 2017, Saturnalia continuó su proyecto y se asoció con un nuevo miembro como guitarrista y bajista, pero él se fue después de unos meses debido a diferencias musicales. En 2018, Saturnalia sube un fragmento de su canción 'A.M.' y en los años siguientes se centró en la interpretación hasta 2021, cuando lanzó su primer sencillo 'A.M.' y en diciembre el segundo, 'NECROSIS'. En 2022 lanza 'TELL ME WHAT TO TELL YOU' y realiza su primer show en vivo. En 2023 lanzó 'MECHANIC ANGEL' y 'YOUNG BLOOD'. El videoclip de 'A.M.' se lanzó a mediados de año. Su álbum debut 'WHY TO LIVE FOR A DREAM?' salió en Halloween de ese año con 13 canciones originales y luego, el 29 de febrero de 2024, salió la edición de lujo con 12 canciones nuevas y visualizadores de arte digital. Su segundo álbum 'CAN YOU BE HONEST FOR ONCE?' fue lanzado en Halloween de 2024.",
    },
    albumSection: {
      title: "Discografía",
      buyNow: "Comprar Ahora",
    },
    contactSection: {
      title: "Hacer Contacto",
      description: "¿Tienes una pregunta, una propuesta o simplemente quieres conectar? Deja un mensaje en el flujo de datos.",
      form: {
        name: {
          label: "Alias",
          placeholder: "Tu alias",
        },
        email: {
          label: "Canal Seguro (Email)",
          placeholder: "tu.direccion@protocolo.net",
        },
        message: {
          label: "Mensaje",
          placeholder: "Tu mensaje...",
        },
        submit: "Enviar Mensaje",
      },
      toast: {
        title: "¡Mensaje Enviado!",
        description: "Gracias por contactar. Te responderemos a la brevedad.",
      },
    },
  },
};
