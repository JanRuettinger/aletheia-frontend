function LoadingSpinner() {
  return (
    <div className='w-full h-full fixed block top-0 left-0 bg-white opacity-50 z-50'>
      <div className='h-full inset-1/2 my-0 mx-auto block'>
        <div className='h-full flex flex-row animate-pulse items-center justify-center space-x-2'>
          <div className='h-14 w-14 rounded-full bg-black'></div>
          <div className='h-14 w-14 rounded-full bg-black'></div>
          <div className='h-14 w-14 rounded-full bg-black'></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
