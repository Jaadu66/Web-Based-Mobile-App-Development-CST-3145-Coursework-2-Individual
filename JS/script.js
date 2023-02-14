const app = new Vue({
  el: '#app',
  data: () => {
    //datasets
    return {
      page: 'products',
      cart: [],
      search: '',
      sortBy: 'subject',
      sortDirection: 'asc',
      products: [],
      checkout: [],
      order: {
        name: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        state: '',
        method: 'Home',
        gift: false,
      },
      //Drop down list for the states
      states: {
        AUH: 'Abu Dhabi',
        AJM: 'Ajman',
        DXB: 'Dubai',
        FUJ: 'Fujairah',
        RAK: 'Ras Al Khaimah',
        SHJ: 'Sharjah',
        UMM: 'Umm Al Quwain',
      },
    };

  },
  created() {
    fetch("http://localhost:3000/collection/products")
      .then((response) => response.json())
      .then((data) => {
        this.products = data;
      });


  },

  watch: {
    search: function (val) {
      fetch("http://localhost:3000/collection/products/" + this.search)
        .then(
          function (response){
            response.json()
            console.log(response)
            this.products = response
          }
        )
    },
  },

  methods: {
    //Pushes product to the cart
    addToCart(product) {
      //Child pushes component to the parent
      this.$emit("addItemToCart", product);
      console.log(product.id);
      if (!this.cart.includes(product)) {
        this.cart.push(product);
      }
      else
        console.log("Product exists in cart");
      product.cartquantity++;


      
      //Minus quantity from the total
      this.products.forEach((item) => {
        if (item.id === product.id) {
          item.space -= 1;
        }
      }
      )
    },


    removeFromCart(product) {
      console.log("Removed product  " + product.id);
      //Remove the product all together from the cart if its less than 1
      if (product.cartquantity === 1) {
        this.cart.splice(product, 1);
        product.cartquantity = 0;
      }
      else {
        product.cartquantity--;
        console.log("cartquantity: " + product.cartquantity);
      }

      //increase the quantity of the products in inventory
      this.products.forEach((item) => {
        if (item.id === product.id) {
          item.space += 1;
        }
      }
      )
    },

    navigateTo(page) {
      this.page = page;
      console.log(this.page);
    },

    quantityCount(product) {
      if (product.space > 0) {
        return true;
      } else {
        return false;
      }
    },

    onSubmitCheckout: function () {
      // if (
      //   this.order.name &&
      //   this.order.email &&
      //   this.order.address &&
      //   this.order.city &&
      //   this.order.zip &&
      //   this.order.state
      // ) {
        this.checkout.push(this.order);
        this.order = {
          name: "",
          email: "",
          address: "",
          city: "",
          zip: "",
          state: "",
          method: "Home",
          gift: false,
        };
        this.finalorder = {
          name: this.checkout[0].name,
          email: this.checkout[0].email,
          address: this.checkout[0].address,
          city: this.checkout[0].city,
          zip: this.checkout[0].zip,
          state: this.checkout[0].state,
          method: this.checkout[0].method,
          gift: this.checkout[0].gift,
          products: this.cart,
          total: this.cart.reduce((acc, item) => acc + item.price, 0) + " AED",
        };
        console.log(this.finalorder);

        // Swal.fire(
        //   "Order Submitted!",
        //   "Your order has been submitted!",
        //   "success"
        // );


        // push finalorder to http://localhost:3000/collection/orders
        fetch("http://localhost:3000/collection/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.finalorder),
        })
          .then((response) => {
            console.log(response);
            return response.text();
          })
          .then((data) => {
            // resolve(data ? JSON.parse(data) : {})
            console.log("Success:", data);
            console.log(this.finalorder);
          })
          .catch((error) => {
            console.error("Error:", error);
          })
          
          const tempObj = {space: this.cart[0].space}
          fetch("http://localhost:3000/collection/products/" + this.cart[0]._id, {	
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tempObj),
          })
            .then((response) => {
              console.log(response);
              return response.text();
            })
            .then((data) => {
              console.log("Success:", data);
              console.log(this.finalorder);
            })
  
        this.cart = [];
        this.navigateTo("products");
      // } 
      // else {
      //   Swal.fire(
      //     "Missing Fields?",
      //     "Please Make Sure all fields are filled out",
      //     "error"
      //   );
      //   this.page = "checkout";
      // } 
    },

    checkoutCart() {
      if (this.cart.length > 0) {
        this.page = "checkout";
      } else {
        Swal.fire(
          'Empty Cart?',
          'Add something from the store first!',
          'question'
        )
      }
    },
  },
  computed: {
    filteredProducts() {
      if (this.search) {
        let search = this.search.toLowerCase();
        return this.products.filter((product) => {
        return product.subject.toLowerCase().match(search) || product.location.toLowerCase().match(search);
        });
      }
      //This block sorts the products according to subject
      else if (this.sortBy === 'subject') {
        return this.products.sort((a, b) => {
          if (this.sortDirection === 'asc') {
            return a.subject.localeCompare(b.subject);
          } else if (this.sortDirection === 'desc') {
            return b.subject.localeCompare(a.subject);
          }
        })
      }
      //This block sorts the products according to price
      else if (this.sortBy === 'price') {
        return this.products.sort((a, b) => {
          if (this.sortDirection === 'asc') {
            return a.price - b.price;
          } else if (this.sortDirection === 'desc') {
            return b.price - a.price;
          }
        });
      }
      //This block sorts the products according to quantity
      else if (this.sortBy === 'quantity') {
        return this.products.sort((a, b) => {
          if (this.sortDirection === 'asc') {
            return a.quantity - b.quantity;
          } else if (this.sortDirection === 'desc') {
            return b.quantity - a.quantity;
          }
        });
      }
      //Return products as it is if no filter
      else {
        return this.products;
      }
    },

    //Method to take sum of the products added in cart
    cartTotal() {
      let total = 0;
      this.cart.forEach((item) => {
        total += item.price * item.cartquantity;
      });
      console.log(total);
      return total;
    },

   
    cartCount() {
      let count = 0;
      this.cart.forEach((item) => {
        count += item.cartquantity;
      });
      console.log(count);
      return count;
    },
  },



});