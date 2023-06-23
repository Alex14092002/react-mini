
// Hàm truy cập thuộc tính sử dụng chuỗi đường dẫn
export function propAccess(obj, path) {
  return path.split(".").reduce((o, p) => (o ? o[p] : undefined), obj);
}

// Hàm kiểm tra kiểu dữ liệu
export function isType(value, type) {
  return typeof value === type;
}

// Hàm nội suy chuỗi
String.prototype.interpolate = function (params) {
  return this.replace(/\{\{([^}]+)\}\}/g, (_, key) =>
    propAccess(params, key.trim())
  );
};

// index.js

// Quản lý định tuyến
function navigateTo(path) {
  const basePath = "/dist/index.html";
  const fullPath = `${basePath}${path}`;
  window.history.pushState(null, null, fullPath);
  renderApp();
}


// Tạo phần tử DOM
function createElement(type, props, ...children) {
  if (typeof type === "function") {
    return type(props, children);
  }
  const element = document.createElement(type);

  if (props) {
    for (let propName in props) {
      if (props.hasOwnProperty(propName)) {
        const propValue = props[propName];
        if (propName === "style") {
          for (let styleName in propValue) {
            if (propValue.hasOwnProperty(styleName)) {
              element.style[styleName] = propValue[styleName];
            }
          }
        } else if (
          propName.startsWith("on") &&
          typeof propValue === "function"
        ) {
          const eventName = propName.slice(2).toLowerCase();
          element.addEventListener(eventName, propValue);
        } else {
          element.setAttribute(propName, propValue);
        }
      }
    }
  }

  if (children) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

// Xác thực thuộc tính của thành phần
function validateProps(component, props) {
  if (component.propTypes) {
    for (let propName in component.propTypes) {
      if (!props.hasOwnProperty(propName)) {
        throw new Error(
          `Missing prop '${propName}' in component '${component.name}'.`
        );
      }
      const propType = component.propTypes[propName];
      if (typeof props[propName] !== propType) {
        throw new Error(
          `Invalid prop '${propName}' in component '${
            component.name
          }'. Expected '${propType}', but received '${typeof props[propName]}'.`
        );
      }
    }
  }
}

// Component cơ bản với phương thức display() và shouldUpdate()
class Component {
  constructor(props) {
    this.props = props;
    this.oldProps = {};
  }

  shouldUpdate() {
    for (let prop in this.props) {
      if (this.props[prop] !== this.oldProps[prop]) {
        return true;
      }
    }
    return false;
  }

  display() {
    if (this.shouldUpdate()) {
      this.oldProps = { ...this.props };
      this.render();
    }
  }
  render() {
    // Triển khai render() trong các lớp con
  }
}

// Định nghĩa các thành phần và xử lý định tuyến
const components = {};

function defineComponent(name, component) {
  components[name] = component;
}

function renderComponent(componentName, props, parent) {
  const component = components[componentName];
  if (!component) {
    throw new Error(`Component '${componentName}' is not defined.`);
  }

  validateProps(component, props);

  const instance = new component(props);
  instance.element = createElement("div");

  instance.display();

  const { children } = props;
  if (children) {
    children.forEach((child) => {
      if (typeof child === "object") {
        renderComponent(child.component, child.props, instance.element);
      } else {
        const childElement = createElement("div", null, child);
        instance.element.appendChild(childElement);
      }
    });
  }

  parent.appendChild(instance.element);
}

// Render to DOM
function renderApp() {
  const rootElement = document.getElementById("root");
  rootElement.innerHTML = "";

  const path = window.location.pathname;
  const route = routes.find((route) => route.path === path);

  if (route) {
    renderComponent(route.component, route.props, rootElement);
  } else {
    renderComponent("NotFound", {}, rootElement);
  }
}

// Đăng ký định tuyến
const routes = [];

function registerRoute(path, component, props) {
  routes.push({ path, component, props });
}

// Đăng ký các thành phần
defineComponent(
    "Home",
    class extends Component {
      render() {
        return createElement("h1", null, "Home Page");
      }
    }
  );
  
  defineComponent(
    "About",
    class extends Component {
      render() {
        return createElement("h1", null, "About Page");
      }
    }
  );
  
  defineComponent(
    "Contact",
    class extends Component {
      render() {
        return createElement("h1", null, "Contact Page");
      }
    }
  );
  
  defineComponent(
    "NotFound",
    class extends Component {
      render() {
        return createElement("h1", null, "404 - Page Not Found");
      }
    }
  );
  

// Đăng ký định tuyến
registerRoute("/dist/index.html", "Home");
registerRoute("/dist/index.html/about", "About");
registerRoute("/dist/index.html/contact", "Contact");
registerRoute("/dist/index.html/notfound", "NotFound");

// Khởi tạo ứng dụng
function initApp() {
  renderApp();

  // Lắng nghe sự kiện định tuyến
  window.onpopstate = () => {
    renderApp();
  };
}

const obj = {
  foo: {
    bar: {
      baz: "Hello, world!",
    },
  },
};

const value = propAccess(obj, "foo.bar.baz");
console.log(value); // Output: Hello, world!

// Sử dụng String.interpolate
const template = "Type of animal: {{ type.name }}";
const animal = { type: { name: "dog" } };
const interpolatedString = template.interpolate(animal);
console.log(interpolatedString); // Output: Type of animal: dog

// Sử dụng type_checker
const stringValue = "Hello";
const numberValue = 42;

console.log(isType(stringValue, "string")); // Output: true
console.log(isType(numberValue, "number")); // Output: true
console.log(isType(stringValue, "number")); // Output: false

// Khởi chạy ứng dụng
initApp();


