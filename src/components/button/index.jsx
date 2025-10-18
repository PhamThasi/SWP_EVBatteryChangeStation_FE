// import "./style.css";

// const Button = (props) => {
//   const { children, className = "", ...rest } = props;
//   return (
//     <button className={`btn ${className}`} {...rest}>
//       {children}
//     </button>
//   );
// };

// export default Button;
import "./style.css";

const Button = (props) => {
  const { children, className = "", ...rest } = props;

  return (
    <button className={`auth-btn ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
