const formatTcmId = (id: string): string => {
  if (!id) return id;
  return id.replace(/:/g, '_');
};

export default formatTcmId;