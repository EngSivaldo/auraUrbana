/**
 * script.js
 * Lógica JavaScript Principal para Aura Urbana
 */

// =======================================================
// 0. DEFINIÇÃO DE DADOS (PRODUCTS)
// =======================================================

// Array que simula um banco de dados de produtos
const PRODUCTS = [
  {
    id: "P001",
    name: "Sobretudo Clássico Tweed",
    price: 1199.9,
    category: "Casacos",
    image:
      "https://images.unsplash.com/photo-1611312449412-6cefac5dc2b5?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: "P002",
    name: "Camisa de Linho Branca",
    price: 349.9,
    category: "Camisas",
    image:
      "https://images.unsplash.com/photo-1617058810260-03c0595d2f62?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: "P003",
    name: "Bota Chelsea de Couro",
    price: 789.9,
    category: "Calçados",
    image:
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1915&auto=format&fit=crop",
  },
  {
    id: "P004",
    name: "Blazer de Lã Cinza",
    price: 899.9,
    category: "Blazers",
    image:
      "https://images.unsplash.com/photo-1610384104075-e06bde473c2f?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: "P005",
    name: "Calça Chino Bege Slim",
    price: 299.9,
    category: "Calças",
    image:
      "https://images.unsplash.com/photo-1594541049182-0346f06f2b18?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "P006",
    name: "Tênis Casual em Lona",
    price: 429.5,
    category: "Calçados",
    image:
      "https://images.unsplash.com/photo-1600269460596-f9463b723521?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "P007",
    name: "Vestido Midi Plissado",
    price: 550.0,
    category: "Vestidos",
    image:
      "https://images.unsplash.com/photo-1548883733-5b82e22f2814?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: "P008",
    name: "Jaqueta Bomber em Couro",
    price: 980.0,
    category: "Casacos",
    image:
      "https://images.unsplash.com/photo-1596700877918-c2b6941d40a5?q=80&w=1935&auto=format&fit=crop",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  // =======================================================
  // 1. INICIALIZAÇÃO E VARIÁVEIS DO CARRINHO
  // =======================================================

  // Elementos do Carrinho
  const cartPanel = document.getElementById("cart-panel");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartBtn = document.getElementById("cart-btn");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartCountElement = document.getElementById("cart-count");
  const cartTotalElement = document.getElementById("cart-total");
  const cartItemsList = document.getElementById("cart-items-list");
  const productGrid = document.getElementById("products-list"); // Para delegação na index.html
  const checkoutBtn = document.querySelector(".checkout-btn"); // Botão "Finalizar Compra"

  // Variável para a lista de produtos (pode ser null se não for index.html)
  const productsListElement = document.getElementById("products-list");

  // Variáveis de Filtro (protegidas por verificação posterior)
  const categoryFilter = document.getElementById("category-filter");
  const priceRangeFilter = document.getElementById("price-range-filter");
  const maxPriceDisplay = document.getElementById("max-price-display");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");

  let cart = []; // Array principal para armazenar os itens do carrinho

  // =======================================================
  // 2. FUNÇÕES DO CARRINHO (CRUD e Renderização)
  // =======================================================

  /**
   * Carrega o carrinho do LocalStorage.
   */
  const loadCart = () => {
    const storedCart = localStorage.getItem("auraUrbanaCart");
    if (storedCart) {
      try {
        // Tenta fazer o parse (conversão de string JSON para objeto/array JS)
        cart = JSON.parse(storedCart);
      } catch (e) {
        // Se der erro (ex: dados corrompidos), inicia com carrinho vazio
        console.error("Erro ao carregar carrinho do LocalStorage:", e);
        cart = [];
      }
    }
    renderCart();
  };

  /**
   * Salva o carrinho no LocalStorage.
   */
  const saveCart = () => {
    localStorage.setItem("auraUrbanaCart", JSON.stringify(cart));
    updateCartCount();
  };

  /**
   * Adiciona um produto ao carrinho.
   */
  const addToCart = (id, name, price) => {
    const existingItem = cart.find((item) => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price: parseFloat(price), quantity: 1 });
    }

    saveCart();
    renderCart();
    openCartPanel(); // Abre o painel do carrinho ao adicionar
  };

  /**
   * Atualiza a quantidade de um item no carrinho.
   */
  const updateQuantity = (id, change) => {
    const item = cart.find((i) => i.id === id);

    if (item) {
      item.quantity += change;

      if (item.quantity <= 0) {
        // Remove o item se a quantidade for zero ou negativa
        cart = cart.filter((i) => i.id !== id);
      }

      saveCart();
      renderCart();
      // Adicionado para atualizar o resumo na página de checkout após alteração de quantidade
      renderCheckoutSummary();
    }
  };

  /**
   * Remove um item do carrinho.
   */
  const removeItem = (id) => {
    cart = cart.filter((item) => item.id !== id);
    saveCart();
    renderCart();
    // Adicionado para atualizar o resumo na página de checkout após remoção
    renderCheckoutSummary();
  };

  /**
   * Renderiza a lista de itens e o total no painel do carrinho.
   */
  const renderCart = () => {
    if (!cartItemsList || !cartTotalElement) return;

    cartItemsList.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsList.innerHTML =
        '<p class="empty-message text-gray-500 italic p-4">O seu carrinho está vazio.</p>';
      cartTotalElement.textContent = "R$ 0,00";
      return;
    }

    cart.forEach((item) => {
      const itemSubtotal = item.price * item.quantity;
      total += itemSubtotal;

      const itemElement = document.createElement("div");
      itemElement.classList.add(
        "cart-item",
        "flex",
        "items-center",
        "justify-between",
        "border-b",
        "pb-3",
        "mb-3"
      );

      const formattedPrice = item.price.toFixed(2).replace(".", ",");
      const formattedSubtotal = itemSubtotal.toFixed(2).replace(".", ",");

      itemElement.innerHTML = `
              <div class="flex-1 pr-4">
                  <p class="item-name font-semibold text-dark-gray truncate">${item.name}</p>
                  <p class="item-price text-sm text-gray-500 mt-1">
                      R$ ${formattedPrice} x ${item.quantity} = 
                      <span class="font-bold text-primary">R$ ${formattedSubtotal}</span>
                  </p>
              </div>
              
              <div class="flex items-center space-x-2 flex-shrink-0">
                  <div class="flex border border-gray-300 rounded-lg">
                      <button class="btn-quantity decrease-quantity w-7 h-7 bg-gray-100 hover:bg-gray-200 text-dark-gray rounded-l-lg leading-none" data-id="${item.id}">-</button>
                      <span class="item-quantity px-2 text-dark-gray flex items-center">${item.quantity}</span>
                      <button class="btn-quantity increase-quantity w-7 h-7 bg-gray-100 hover:bg-gray-200 text-dark-gray rounded-r-lg leading-none" data-id="${item.id}">+</button>
                  </div>
                  <button class="remove-item text-red-500 hover:text-red-700 text-xl leading-none ml-2" data-id="${item.id}" title="Remover">&times;</button>
              </div>
          `;

      cartItemsList.appendChild(itemElement);
    });

    // Atualiza o total
    cartTotalElement.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  };

  /**
   * Renderiza o resumo do carrinho na página de checkout.
   */
  const renderCheckoutSummary = () => {
    const checkoutList = document.getElementById("checkout-items-list");
    const checkoutTotalFinal = document.getElementById("checkout-total-final");
    const checkoutSubtotal = document.getElementById("checkout-subtotal");

    if (!checkoutList || !checkoutTotalFinal || !checkoutSubtotal) return; // Se não estiver na página de checkout, não faz nada

    checkoutList.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
      // Se o carrinho estiver vazio, redireciona de volta para a homepage
      checkoutList.innerHTML =
        '<p class="text-red-500 font-semibold text-center">O carrinho está vazio. Redirecionando...</p>';
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
      return;
    }

    cart.forEach((item) => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      const formattedPrice = item.price.toFixed(2).replace(".", ",");
      const formattedSubtotal = itemSubtotal.toFixed(2).replace(".", ",");

      const itemElement = document.createElement("div");
      itemElement.classList.add(
        "flex",
        "justify-between",
        "items-start",
        "border-b",
        "border-gray-200",
        "pb-2",
        "last:border-b-0",
        "last:pb-0"
      );
      itemElement.innerHTML = `
              <div>
                  <p class="font-medium text-dark-gray">${item.name}</p>
                  <p class="text-sm text-gray-500">${item.quantity} x R$ ${formattedPrice}</p>
              </div>
              <p class="font-semibold text-dark-gray">R$ ${formattedSubtotal}</p>
          `;

      checkoutList.appendChild(itemElement);
    });

    // Atualiza os totais
    const totalFormatted = subtotal.toFixed(2).replace(".", ",");
    checkoutSubtotal.textContent = `R$ ${totalFormatted}`;
    // Assumimos frete grátis, então total é igual ao subtotal
    checkoutTotalFinal.textContent = `R$ ${totalFormatted}`;
  };

  /**
   * Atualiza o contador de itens no ícone do carrinho.
   */
  const updateCartCount = () => {
    if (!cartCountElement) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
  };

  // =======================================================
  // 3. FUNÇÕES DE MANIPULAÇÃO DO DOM (Ouvintes de Carrinho e Checkout)
  // =======================================================

  /**
   * Abre o painel lateral do carrinho.
   */
  const openCartPanel = () => {
    if (cartPanel) {
      cartPanel.classList.add("open");
      cartOverlay.classList.add("open");
    }
  };

  /**
   * Fecha o painel lateral do carrinho.
   */
  const closeCartPanel = () => {
    if (cartPanel) {
      cartPanel.classList.remove("open");
      cartOverlay.classList.remove("open");
    }
  };

  // Ouvinte para abrir o carrinho
  if (cartBtn) {
    cartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openCartPanel();
    });
  }

  // Ouvinte para fechar o carrinho
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCartPanel);
  }

  // Ouvinte para fechar o carrinho clicando no overlay
  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCartPanel);
  }

  // Delegação de eventos para botões de adicionar ao carrinho (GLOBAL)
  // Garante que os botões funcionem em qualquer página.
  document.addEventListener("click", (e) => {
    const button = e.target.closest(".js-add-to-cart");

    if (button && !button.classList.contains("detail-add-btn")) {
      // Ignora o botão de detalhe para evitar duplicidade de ação
      e.preventDefault();

      const id = button.getAttribute("data-id");
      const name = button.getAttribute("data-name");
      const price = button.getAttribute("data-price");

      if (id && name && price) {
        addToCart(id, name, price);
      } else {
        console.error(
          "Erro: Botão 'Adicionar ao Carrinho' sem atributos de dados (data-id, data-name, data-price)."
        );
      }
    }
  });

  // Delegação de eventos para botões dentro da lista do carrinho
  if (cartItemsList) {
    cartItemsList.addEventListener("click", (e) => {
      const target = e.target;
      const id = target.getAttribute("data-id");

      if (!id) return;

      if (target.classList.contains("increase-quantity")) {
        updateQuantity(id, 1);
      } else if (target.classList.contains("decrease-quantity")) {
        updateQuantity(id, -1);
      } else if (target.classList.contains("remove-item")) {
        removeItem(id);
      }
    });
  }

  // Ouvinte para o botão Finalizar Compra
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      // Verifica se o carrinho não está vazio antes de prosseguir
      if (cart.length > 0) {
        window.location.href = "checkout.html";
      } else {
        alert(
          "Seu carrinho está vazio. Adicione produtos antes de finalizar a compra."
        );
      }
    });
  }

  // =======================================================
  // 4. LÓGICA DO MENU MOBILE
  // =======================================================

  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const mobileMenuPanel = document.getElementById("mobile-menu-panel");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");

  if (menuToggleBtn && mobileMenuPanel && mobileMenuOverlay) {
    // Função para abrir o menu
    const openMobileMenu = () => {
      mobileMenuPanel.classList.remove("-translate-x-full");
      mobileMenuOverlay.classList.remove("hidden");
    };

    // Função para fechar o menu
    const closeMobileMenu = () => {
      mobileMenuPanel.classList.add("-translate-x-full");
      mobileMenuOverlay.classList.add("hidden");
    };

    menuToggleBtn.addEventListener("click", openMobileMenu);
    closeMenuBtn.addEventListener("click", closeMobileMenu);
    mobileMenuOverlay.addEventListener("click", closeMobileMenu);

    // Fechar menu ao clicar num link (para navegação)
    mobileMenuPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // =======================================================
  // 5. VALIDAÇÃO DO FORMULÁRIO DE CONTACTO
  // =======================================================

  const contactForm = document.getElementById("contact-form");
  const formSuccessMessage = document.getElementById("form-success");

  if (contactForm) {
    // Função de validação de campo individual
    const validateField = (input) => {
      // Verifica se o input e seus elementos pais existem
      const container = input.closest(".form-group");
      const errorMessage = document.getElementById(`${input.id}-error`);
      let isValid = true;
      let message = "";

      // 1. Validação de Campo Vazio
      if (input.hasAttribute("required") && input.value.trim() === "") {
        isValid = false;
        message = "Este campo é obrigatório.";
      }

      // 2. Validação de E-mail
      else if (input.id === "email" && input.value.trim() !== "") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value.trim())) {
          isValid = false;
          message = "Por favor, insira um endereço de e-mail válido.";
        }
      }

      // 3. Validação do Assunto
      else if (input.id === "subject" && input.value === "") {
        isValid = false;
        message = "Por favor, selecione um assunto.";
      }

      // Atualizar classes e mensagens
      if (container && errorMessage) {
        if (isValid) {
          container.classList.remove("error");
          errorMessage.textContent = "";
        } else {
          container.classList.add("error");
          errorMessage.textContent = message;
        }
      }
      return isValid;
    };

    // Ouvinte de submissão do formulário
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let formIsValid = true;
      const requiredInputs = contactForm.querySelectorAll(
        "input[required], select[required], textarea[required]"
      );

      // Valida todos os campos ao submeter
      requiredInputs.forEach((input) => {
        if (!validateField(input)) {
          formIsValid = false;
        }
      });

      if (formIsValid) {
        // Simulação de envio bem-sucedido
        console.log("Formulário Submetido com Sucesso:", {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          subject: document.getElementById("subject").value,
          message: document.getElementById("message").value,
        });

        // Mostrar mensagem de sucesso e limpar formulário
        contactForm.reset();
        if (formSuccessMessage) {
          formSuccessMessage.style.display = "block";
          // Esconder a mensagem após 5 segundos
          setTimeout(() => {
            formSuccessMessage.style.display = "none";
          }, 5000);
        }
      }
    });

    // Adicionar validação em tempo real ao perder o foco (blur)
    const inputs = contactForm.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        validateField(input);
      });
    });
  }

  // =======================================================
  // 5.5. LÓGICA DE SIMULAÇÃO DE PAGAMENTO (CHECKOUT)
  // =======================================================

  const checkoutForm = document.getElementById("checkout-form");

  if (checkoutForm) {
    // Simulação de processamento de pagamento
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // 1. Validação simples dos campos de envio
      const requiredFields = checkoutForm.querySelectorAll("[required]");
      let allValid = true;

      requiredFields.forEach((field) => {
        if (field.type !== "radio" && !field.value.trim()) {
          allValid = false;
          field.classList.add("border-red-500");
        } else {
          field.classList.remove("border-red-500");
        }
      });

      // Adicionalmente, verifica se pelo menos um método de pagamento está selecionado
      const paymentMethodSelected = checkoutForm.querySelector(
        'input[name="payment_method"]:checked'
      );
      if (!paymentMethodSelected) {
        allValid = false;
      }

      if (!allValid) {
        alert(
          "Por favor, preencha todos os campos obrigatórios e selecione um método de pagamento."
        );
        return; // Impede a continuação se houver campos vazios
      }

      // 2. Simulação do Processamento
      const submitButton = checkoutForm.querySelector('button[type="submit"]');

      // Desabilita o botão e mostra um loading
      submitButton.disabled = true;
      submitButton.textContent = "Processando Pagamento...";
      submitButton.classList.remove("bg-secondary", "hover:bg-teal-600");
      submitButton.classList.add("bg-gray-500");

      // 3. Simulação de 3 segundos de processamento
      setTimeout(() => {
        // Gerar um ID de pedido simulado (usando data e um número aleatório)
        const orderId = `AU-${new Date().getFullYear()}-${Math.floor(
          1000 + Math.random() * 9000
        )}`;

        // Capturar o total e os itens do carrinho antes de limpar
        const orderTotalElement = document.getElementById(
          "checkout-total-final"
        );
        const orderTotal = orderTotalElement
          ? orderTotalElement.textContent
          : "R$ 0,00";

        // Função auxiliar para obter o valor de forma segura
        const getInputValue = (id) => {
          const element = document.getElementById(id);
          // Retorna o valor, ou 'Não informado' se o elemento não existir
          return element ? element.value.trim() : "Não informado";
        };

        // Criar o objeto de detalhes do pedido
        const orderDetails = {
          id: orderId,
          date: new Date().toLocaleDateString("pt-BR"),
          items: cart, // Guarda a lista de itens do carrinho
          total: orderTotal,
          customerInfo: {
            name: getInputValue("name"),
            email: getInputValue("email"),
            address: getInputValue("address"),
            phone: getInputValue("phone"),
            city: getInputValue("city"),
            postal_code: getInputValue("postal_code"),
          },
        };

        // 🌟 PASSO CHAVE: SALVAR DETALHES DO PEDIDO NO LOCALSTORAGE
        localStorage.setItem(
          "auraUrbanaLastOrder",
          JSON.stringify(orderDetails)
        );

        // Limpar o carrinho (A COMPRA FOI CONCLUÍDA!)
        cart = [];
        saveCart(); // Salva o carrinho vazio

        // Redireciona para a página de sucesso
        window.location.href = "order-success.html";
      }, 3000); // 3 segundos de espera
    });

    // Lógica para mostrar/esconder campos do cartão
    const paymentRadios = checkoutForm.querySelectorAll(
      'input[name="payment_method"]'
    );
    const creditCardFields = document.getElementById("credit-card-fields");

    const updateCreditCardRequiredStatus = () => {
      const isCreditCardSelected =
        checkoutForm.querySelector('input[name="payment_method"]:checked')
          ?.value === "credit_card";

      if (isCreditCardSelected) {
        creditCardFields.style.display = "block";
        // Requer campos de cartão ao selecionar Cartão de Crédito
        creditCardFields
          .querySelectorAll("input")
          .forEach((input) => input.setAttribute("required", "required"));
      } else {
        creditCardFields.style.display = "none";
        // Remove 'required' para não bloquear a submissão com PIX/Boleto
        creditCardFields
          .querySelectorAll("input")
          .forEach((input) => input.removeAttribute("required"));
      }
    };

    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", updateCreditCardRequiredStatus);
    });

    // Inicializa a visibilidade dos campos de cartão
    updateCreditCardRequiredStatus();
  }

  // =======================================================
  // 5.6. LÓGICA DE CARREGAMENTO DOS DETALHES DO PEDIDO (order-success.html)
  // =======================================================

  /**
   * Carrega e exibe os detalhes do último pedido salvo.
   */
  const loadOrderDetails = () => {
    // Tenta obter o JSON do último pedido
    const storedOrder = localStorage.getItem("auraUrbanaLastOrder");

    // 🛡️ Proteção: Se não estivermos na página de sucesso (os IDs não existem), sai.
    if (!document.getElementById("order-id")) return;

    if (!storedOrder) {
      // Caso não haja dados de pedido (ex: acesso direto à página)
      const mainContent = document.querySelector("main");
      if (mainContent) {
        mainContent.innerHTML = `
                  <div class="max-w-md mx-auto p-10 bg-white shadow-xl rounded-xl text-center">
                      <p class="text-red-500 text-xl font-bold mb-4">Nenhum pedido recente encontrado.</p>
                      <p class="text-gray-600 mb-6">Por favor, finalize uma compra para ver os detalhes aqui.</p>
                      <a href="index.html" class="inline-block bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700">Voltar à Loja</a>
                  </div>
              `;
      }
      return;
    }

    try {
      const order = JSON.parse(storedOrder);
      const customer = order.customerInfo;

      // 1. Detalhes Principais
      document.getElementById("order-id").textContent = `#${order.id}`;
      document.getElementById("order-date").textContent = order.date;
      document.getElementById("order-total").textContent = order.total;

      // 2. Endereço de Envio
      document.getElementById("customer-name").textContent = customer.name;
      document.getElementById("customer-address").textContent =
        customer.address;
      document.getElementById("customer-city").textContent = `${customer.city}`;
      document.getElementById("customer-postal-code").textContent =
        customer.postal_code;
      document.getElementById("customer-email").textContent = customer.email;

      // 3. Lista de Itens
      const itemsList = document.getElementById("order-items-list");
      itemsList.innerHTML = "";

      order.items.forEach((item) => {
        const itemSubtotal = item.price * item.quantity;
        const formattedPrice = item.price.toFixed(2).replace(".", ",");
        const formattedSubtotal = itemSubtotal.toFixed(2).replace(".", ",");

        const itemElement = document.createElement("div");
        itemElement.classList.add(
          "flex",
          "justify-between",
          "border-b",
          "pb-2",
          "last:border-b-0"
        );
        itemElement.innerHTML = `
                  <div>
                      <p class="font-medium text-dark-gray">${item.name}</p>
                      <p class="text-sm text-gray-500">${item.quantity} x R$ ${formattedPrice}</p>
                  </div>
                  <p class="font-semibold text-dark-gray">R$ ${formattedSubtotal}</p>
              `;
        itemsList.appendChild(itemElement);
      });
    } catch (e) {
      console.error("Erro ao carregar ou exibir detalhes do pedido:", e);
      document.getElementById("order-id").textContent =
        "Erro ao carregar detalhes.";
    }
  };

  // =======================================================
  // 5.7. LÓGICA DE CARREGAMENTO DO DETALHE DO PRODUTO (product-detail.html)
  // =======================================================

  /**
   * Carrega e exibe os detalhes de um único produto, buscando o ID na URL.
   */
  const loadProductDetail = () => {
    const detailContainer = document.getElementById("product-detail-container");
    if (!detailContainer) return; // Sai se não estiver na página correta

    // 1. Obter o ID do produto da URL (Ex: product-detail.html?id=P001)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    // 2. Buscar o produto no array global PRODUCTS
    const product = PRODUCTS.find((p) => p.id === productId);

    detailContainer.innerHTML = ""; // Limpa a mensagem de loading

    if (!product) {
      // Produto não encontrado
      detailContainer.innerHTML = `
              <div class="text-center py-20">
                  <h1 class="text-3xl font-bold text-red-500 mb-4">Produto Não Encontrado</h1>
                  <p class="text-lg text-gray-600">O ID do produto (${productId}) não é válido ou não existe em nosso catálogo.</p>
                  <a href="index.html" class="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition">Voltar à Loja</a>
              </div>
          `;
      const pageTitle = document.getElementById("page-title");
      if (pageTitle) pageTitle.textContent = "Produto Não Encontrado";
      return;
    }

    // 3. Renderizar os detalhes do produto
    const formattedPrice = product.price.toFixed(2).replace(".", ",");

    // Atualiza o título da página
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) pageTitle.textContent = `${product.name} - Aura Urbana`;

    detailContainer.innerHTML = `
          <div class="grid md:grid-cols-2 gap-12 items-start">
              <div class="md:sticky md:top-24">
                  <img id="product-image" src="${product.image}" alt="${product.name}" 
                      class="w-full h-auto rounded-lg shadow-xl object-cover aspect-square">
              </div>

              <div>
                  <span class="text-sm font-semibold text-primary uppercase tracking-wider">${product.category}</span>
                  <h1 id="product-name" class="text-4xl lg:text-5xl font-extrabold text-dark-gray mt-2 mb-4">${product.name}</h1>
                  
                  <p id="product-price" class="text-4xl font-extrabold text-secondary mb-8">R$ ${formattedPrice}</p>
                  
                  <div class="mb-8">
                      <h3 class="text-xl font-bold mb-3 border-b pb-1">Descrição</h3>
                      <p class="text-gray-700 leading-relaxed">
                          Este é um produto de alta qualidade, feito com materiais premium. Perfeito para o seu estilo 
                          urbano e sofisticado. Detalhes em lã natural e corte slim para um caimento impecável. 
                          Disponível em tamanhos limitados.
                      </p>
                  </div>

                  <div class="space-y-6">
                      <div>
                          <label for="size-select" class="block text-lg font-semibold mb-2">Tamanho:</label>
                          <select id="size-select" class="w-full md:w-auto p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                              <option>P</option>
                              <option>M</option>
                              <option selected>G</option>
                              <option>GG</option>
                          </select>
                      </div>

                      <div>
                          <label for="quantity-input" class="block text-lg font-semibold mb-2">Quantidade:</label>
                          <input id="quantity-input" type="number" value="1" min="1" max="10" 
                              class="w-20 p-3 border border-gray-300 rounded-lg text-center focus:ring-primary focus:border-primary">
                      </div>
                      
                      <button data-id="${product.id}" 
                              data-name="${product.name}" 
                              data-price="${product.price}"
                              class="w-full bg-primary text-white py-4 rounded-lg text-xl font-bold hover:bg-indigo-600 transition duration-150 js-add-to-cart detail-add-btn">
                          <svg class="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                          Adicionar ao Carrinho
                      </button>
                  </div>
                  
                  <div id="added-message" class="mt-4 p-3 bg-secondary text-white rounded-lg hidden">
                      Adicionado ao carrinho!
                  </div>
              </div>
          </div>
      `;

    // Adiciona um listener especial para o botão Adicionar ao Carrinho na página de detalhe
    // Para que ele adicione a quantidade correta (obtida do input)
    const detailAddButton = detailContainer.querySelector(".detail-add-btn");
    const quantityInput = document.getElementById("quantity-input");
    const addedMessage = document.getElementById("added-message");

    if (detailAddButton && quantityInput) {
      detailAddButton.addEventListener("click", (e) => {
        e.preventDefault();
        const quantity = parseInt(quantityInput.value, 10);

        // Adiciona o produto a quantidade de vezes especificada
        for (let i = 0; i < quantity; i++) {
          addToCart(product.id, product.name, product.price);
        }

        // Exibir mensagem de sucesso temporariamente
        addedMessage.classList.remove("hidden");
        setTimeout(() => {
          addedMessage.classList.add("hidden");
        }, 2000);

        // Reseta a quantidade para 1 após a adição
        quantityInput.value = 1;
      });
    }
  };

  // =======================================================
  // 6. LÓGICA DE FILTRAGEM E RENDERIZAÇÃO DE PRODUTOS
  // =======================================================

  /**
   * Renderiza uma lista de produtos na página.
   * @param {Array<Object>} productsArray - A lista de produtos a ser exibida (filtrada ou não).
   */
  function renderProducts(productsArray = PRODUCTS) {
    // 🛡️ Proteção: Sai da função se o elemento principal de lista não existir
    if (!productsListElement) return;

    productsListElement.innerHTML = ""; // Limpa a lista existente

    if (productsArray.length === 0) {
      productsListElement.innerHTML =
        '<p class="text-xl text-gray-600 col-span-full text-center py-10">Nenhum produto encontrado com os filtros aplicados.</p>';
      return;
    }

    productsArray.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add(
        "product-card",
        "bg-white",
        "rounded-lg",
        "shadow-lg",
        "overflow-hidden"
      );

      const formattedPrice = product.price.toFixed(2).replace(".", ",");

      // Agora, o nome e a imagem são links para a página de detalhe do produto
      productElement.innerHTML = `
              <div class="card-image h-64 overflow-hidden">
                  <a href="product-detail.html?id=${product.id}">
                      <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transform hover:scale-105 transition duration-300">
                  </a>
              </div>
              <div class="card-content p-4">
                  <a href="product-detail.html?id=${product.id}">
                      <h3 class="text-xl font-semibold mb-1 truncate hover:text-primary transition duration-150">${product.name}</h3>
                  </a>
                  <p class="text-sm text-gray-500 mb-2">${product.category}</p>
                  <p class="price text-2xl font-bold text-secondary mb-4">R$ ${formattedPrice}</p>
                  <button data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" 
                          class="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-indigo-600 transition duration-150 js-add-to-cart">
                      Adicionar ao Carrinho
                  </button>
              </div>
          `;
      productsListElement.appendChild(productElement);
    });
  }

  /**
   * Popula o dropdown de categorias com base nos produtos disponíveis.
   */
  function populateCategoryFilter() {
    // 🛡️ Proteção: Sai da função se o elemento não existir
    if (!categoryFilter) return;

    // 1. Obter todas as categorias únicas
    const categories = PRODUCTS.map((p) => p.category);
    const uniqueCategories = ["all", ...new Set(categories)].sort();

    // 2. Limpar e popular o dropdown
    categoryFilter.innerHTML = "";
    uniqueCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent =
        category === "all" ? "Todas as Categorias" : category;
      categoryFilter.appendChild(option);
    });
  }

  /**
   * Filtra a lista de produtos com base nos filtros selecionados e atualiza o display.
   */
  function applyFilters() {
    // 🛡️ Proteção: Sai da função se o elemento principal de lista não existir
    if (!productsListElement || !categoryFilter || !priceRangeFilter) return;

    // Obter os valores atuais dos filtros
    const selectedCategory = categoryFilter.value;
    const maxPrice = parseFloat(priceRangeFilter.value);

    let filteredProducts = PRODUCTS;

    // 1. Filtrar por Categoria
    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    // 2. Filtrar por Preço Máximo
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= maxPrice
    );

    // 3. Renderizar a lista filtrada
    renderProducts(filteredProducts);
  }

  // =======================================================
  // 7. INICIALIZAÇÃO FINAL
  // =======================================================

  // Configurações iniciais para os filtros (somente se estiver na index.html)
  if (priceRangeFilter && maxPriceDisplay) {
    // Encontra o preço máximo real nos dados e define o range
    const maxProductPrice = PRODUCTS.reduce(
      (max, product) => Math.max(max, product.price),
      0
    );
    // Arredonda para o múltiplo de 50 ou 100 mais próximo acima
    const priceMax = Math.ceil(maxProductPrice / 50) * 50;

    // Define o máximo do range slider e o valor inicial
    priceRangeFilter.max = priceMax;
    priceRangeFilter.value = priceMax;
    maxPriceDisplay.textContent = `R$ ${priceMax.toFixed(2).replace(".", ",")}`;

    // Inicializa os Produtos e Filtros
    renderProducts();
    populateCategoryFilter();

    // Adiciona Event Listeners para Filtros
    if (categoryFilter) {
      categoryFilter.addEventListener("change", applyFilters);
    }

    if (priceRangeFilter) {
      priceRangeFilter.addEventListener("input", () => {
        // Atualiza o display do preço em tempo real
        if (maxPriceDisplay) {
          maxPriceDisplay.textContent = `R$ ${parseFloat(priceRangeFilter.value)
            .toFixed(2)
            .replace(".", ",")}`;
        }
        applyFilters();
      });
    }

    if (resetFiltersBtn && categoryFilter && priceRangeFilter) {
      resetFiltersBtn.addEventListener("click", () => {
        // Reseta a categoria para 'all'
        categoryFilter.value = "all";

        // Reseta o slider para o valor máximo
        const priceMaxReset = priceRangeFilter.max;
        priceRangeFilter.value = priceMaxReset;

        if (maxPriceDisplay) {
          maxPriceDisplay.textContent = `R$ ${parseFloat(priceMaxReset)
            .toFixed(2)
            .replace(".", ",")}`;
        }
        applyFilters(); // Aplica os filtros (que agora estão resetados)
      });
    }
  }

  loadCart(); // Carrega o carrinho quando a página é carregada

  // Renderiza o resumo do checkout, se estiver na página
  renderCheckoutSummary();

  // Carrega os detalhes do pedido, se estiver na página de sucesso
  loadOrderDetails();

  // Carrega os detalhes do produto, se estiver na página de detalhes
  loadProductDetail();
});
