import { useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./authContext";
import { FavoritesContext } from "./favoritesContext";

function FavoritesProvider({ children }) {
  const { userInfo } = useContext(AuthContext);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    let active = true;

    const loadFavorites = async () => {
      if (!userInfo) {
        setFavoriteIds([]);
        return;
      }

      try {
        const { data } = await api.get("/users/favorites");

        if (active) {
          setFavoriteIds(data.map((product) => product._id));
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadFavorites();

    return () => {
      active = false;
    };
  }, [userInfo]);

  const toggleFavorite = useCallback(async (productId) => {
    const { data } = await api.post(
      `/users/favorites/${productId}`
    );

    setFavoriteIds(data.favoriteIds);

    return data.favoriteIds.includes(productId);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesProvider;
