export const catchAsyncErrors = (thisFunction) => {
  return (req, res, next) => {
    Promise.resolve(thisFunction(req, res, next)).catch(next);
  };
};
