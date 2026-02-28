const BASE_URL = "https://api.thedesignhive.tech";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json();
  return data.imageUrl;
};
